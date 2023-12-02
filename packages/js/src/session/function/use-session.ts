import { KeyManagerActionError } from '../../keys/shared/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type {
  ActiveSession,
  ActiveSessionObservable,
  Session,
  AllSessionsObservable,
  InactiveSession,
} from '../types.js';

export type UseSessionCallback = (error?: KeyManagerActionError<'useSession'>) => unknown;

export function useSession(
  workerDispatch: Pick<WorkerDispatch, 'postToAll'>,
  allSessionsObservable: AllSessionsObservable,
  activeSessionObservable: ActiveSessionObservable,
  clearSession: () => unknown,
  sessionID: number,
  pin: string,
  callback?: UseSessionCallback,
): void {
  workerDispatch.postToAll(
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
        const iterationImportedAddresses = new Set<string>(result.payload.identities);

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

      if (activeSessionObservable.get()) {
        activeSessionObservable.update((activeSession) => {
          const session = activeSession as Session;
          session.active = false;
          delete session.identities;
          return undefined;
        });
      }

      if (ok) {
        // TODO: we need to return all session details in the result and update them here
        allSessionsObservable.update((allSessions) => {
          if (!allSessions[sessionID]) {
            allSessions[sessionID] = {
              id: sessionID,
              metadata: results[0].payload.metadata,
            } as InactiveSession;
          }
          allSessions[sessionID]!.active = true;
          allSessions[sessionID]!.identities = allImportedAddresses;
          activeSessionObservable.update(() => allSessions[sessionID] as ActiveSession);
          return allSessions;
        });
        callback && callback();
      } else {
        clearSession();
        // TODO: return more accurate error if pin incorrect
        if (callback) {
          callback(
            new KeyManagerActionError('useSession', 'One or more workers were out of sync.'),
          );
        }
      }
    },
  );
}
