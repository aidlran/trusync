import type { UnlockSessionResult } from '../../worker/interface/payload/index.js';
import type {
  WorkerDispatch,
  WorkerPostMultiResultCallback,
} from '../../worker/worker-dispatch.js';
import type { ActiveSession, ActiveSessionObservable, AllSessionsObservable } from '../types.js';

export const constructUnlockSession = <T>(
  { postToAll }: Pick<WorkerDispatch, 'postToAll'>,
  activeSession: ActiveSessionObservable,
  allSessions: AllSessionsObservable,
) => {
  const unlockSession = (
    sessionID: number,
    passphrase: string,
    callback?: (result: UnlockSessionResult<T>) => unknown,
  ) => {
    const handler: WorkerPostMultiResultCallback<'session.unlock'> = ([{ payload }]) => {
      const session: ActiveSession<T> = {
        id: payload.id,
        active: true,
      };
      allSessions.update((all) => {
        all[payload.id] = session;
        return all;
      });
      activeSession.update(() => session);
      if (callback) callback(payload as UnlockSessionResult<T>);
    };

    postToAll({ action: 'session.unlock', payload: { id: sessionID, passphrase } }, handler);
  };

  unlockSession.asPromise = (sessionID: number, passphrase: string) => {
    return new Promise<UnlockSessionResult<T>>((resolve) =>
      unlockSession(sessionID, passphrase, resolve),
    );
  };

  return unlockSession;
};
