import { KeyManagerActionError } from '../keys/shared/index.js';
import { type Session as DBSession, getAll } from '../keys/worker/indexeddb.js';
import { WORKER_DISPATCH } from '../worker/index.js';

type BaseSession<T = unknown> = Omit<DBSession<T>, 'salt' | 'nonce' | 'payload'> & {
  id: number;
  onChange?: (session: Session) => unknown;
};

export interface ActiveSession<T = unknown> extends BaseSession<T> {
  active: true;
  identities: Set<string>;
}

export interface InactiveSession<T = unknown> extends BaseSession<T> {
  active: false;
}

export type Session<T = unknown> = ActiveSession<T> | InactiveSession<T>;
export type Sessions = Partial<Record<number, Session>>;

const sessions: Sessions = {};
let emitSessionsChange: undefined | (() => void);

/** Clear the callback function that is called when ANY change occurs to sessions. */
export function clearOnSessionsChange() {
  emitSessionsChange = undefined;
}

/**
 * Register or replace the callback function that is called when ANY change occurs to sessions.
 *
 * @param callback A callback that may accept a shallow clone of the sessions map.
 */
export function setOnSessionsChange(callback: (sessions: Sessions) => unknown) {
  emitSessionsChange = () => callback({ ...sessions });
}

let activeSession: ActiveSession | undefined;
let emitActiveSessionChange: undefined | (() => void);

/** Clear the callback function that is called when the active session changes. */
export function clearOnActiveSessionChange() {
  emitActiveSessionChange = undefined;
}

/**
 * Register or replace the callback function that is called when the active session changes.
 *
 * @param callback A callback that may accept the changed active session object.
 */
export function setOnActiveSessionChange(
  callback: (activeSession: ActiveSession | undefined) => unknown,
) {
  emitActiveSessionChange = () => callback(activeSession);
}

export async function getSessions(): Promise<Sessions> {
  // TODO: replace promise with callback
  const retrievedSessions = (await getAll('session')) as Array<DBSession & { id: number }>;
  for (const session of retrievedSessions) {
    const existingSession: Partial<DBSession & Session> = sessions[session.id as number] ?? session;
    delete existingSession.nonce;
    delete existingSession.payload;
    delete existingSession.salt;
    existingSession.active ??= false;
    sessions[session.id] = existingSession as Session;
  }
  emitSessionsChange?.();
  return sessions;
}

export function initSession(
  pin: string,
  metadata?: unknown,
  callback?: (session: KeyManagerActionError<'useSession'> | ActiveSession) => unknown,
): void {
  WORKER_DISPATCH.postToOne(
    {
      action: 'initSession',
      payload: { pin, metadata },
    },
    (result) => useSession(result.payload.sessionID, pin, callback),
  );
}

export function useSession(
  sessionID: number,
  pin: string,
  callback?: (result: KeyManagerActionError<'useSession'> | ActiveSession) => unknown,
): void {
  WORKER_DISPATCH.postToAll(
    {
      action: 'useSession',
      payload: {
        sessionID,
        pin,
      },
    },
    (results) => {
      // We need to check result from all workers and ensure they are in sync
      // If one or more of them borked it, roll it back!

      let allImportedAddresses!: Set<string>;
      let firstRun = true;
      let ok = true;

      for (const result of results) {
        const iterationImportedAddresses = new Set<string>(result.payload.importedAddresses);

        if (!result.ok) {
          ok = false;
        }

        if (firstRun) {
          allImportedAddresses = iterationImportedAddresses;
        } else {
          if (ok) {
            ok = allImportedAddresses.size === iterationImportedAddresses.size;
          }

          if (ok) {
            for (const address of iterationImportedAddresses) {
              ok = allImportedAddresses.has(address as string);
              if (!ok) break;
            }
          }

          if (!ok) {
            for (const address of iterationImportedAddresses) {
              allImportedAddresses.add(address as string);
            }
          }
        }

        firstRun = false;
      }

      if (activeSession) {
        (activeSession as { active: boolean }).active = false;
        delete (activeSession as { identities: Set<string> | undefined }).identities;
        activeSession = undefined;
      }

      if (ok) {
        // TODO: we need to return all session details in the result and update them here
        activeSession = (sessions[sessionID] ??= {} as ActiveSession) as ActiveSession;
        activeSession.active = true;
        activeSession.identities = allImportedAddresses;
        callback?.(activeSession);
      } else {
        // TODO: if workers are out of sync, clear the session
        // prev code:
        // await Promise.all(
        //   [...allImportedAddresses].map((address: string) => this.forgetIdentity(address)),
        // );

        // TODO: return more accurate error if pin incorrect

        callback?.(
          new KeyManagerActionError('useSession', 'One or more workers were out of sync.'),
        );
      }
      emitActiveSessionChange?.();
      emitSessionsChange?.();
    },
  );
}
