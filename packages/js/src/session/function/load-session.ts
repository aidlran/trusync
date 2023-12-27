import type { LoadSessionResult } from '../../worker/interface/payload/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { ActiveSession, ActiveSessionObservable, AllSessionsObservable } from '../types.js';

export const constructLoadSession = <T>(
  { postToAll }: Pick<WorkerDispatch, 'postToAll'>,
  activeSession: ActiveSessionObservable,
  allSessions: AllSessionsObservable,
) => {
  const loadSession = (
    sessionID: number,
    passphrase: string,
    callback?: (result: LoadSessionResult<T>) => unknown,
  ): void => {
    postToAll(
      { action: 'session.load', payload: { id: sessionID, passphrase } },
      ([{ payload }]) => {
        const session: ActiveSession<T> = {
          id: payload.id,
          metadata: payload.metadata as T,
          active: true,
        };
        allSessions.update((all) => {
          all[payload.id] = session;
          return all;
        });
        activeSession.update(() => session);
        if (callback) callback(payload as LoadSessionResult<T>);
      },
    );
  };

  loadSession.asPromise = (sessionID: number, passphrase: string) => {
    return new Promise<LoadSessionResult<T>>((resolve) =>
      loadSession(sessionID, passphrase, resolve),
    );
  };

  return loadSession;
};
