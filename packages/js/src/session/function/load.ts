import type { LoadSessionResult } from '../../worker/interface/payload/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { ActiveSession, ActiveSessionObservable, AllSessionsObservable } from '../types.js';

export interface SessionLoadFn<T = unknown> {
  (
    sessionID: number,
    passphrase: string,
    callback?: (result: LoadSessionResult<T>) => unknown,
  ): void;
  asPromise(sessionID: number, passphrase: string): Promise<LoadSessionResult<T>>;
}

export const construct = <T = unknown>(
  { postToAll }: Pick<WorkerDispatch, 'postToAll'>,
  activeSession: ActiveSessionObservable,
  allSessions: AllSessionsObservable,
): SessionLoadFn<T> => {
  const fn: SessionLoadFn<T> = (id, passphrase, callback) => {
    postToAll({ action: 'session.load', payload: { id, passphrase } }, ([{ payload }]) => {
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
    });
  };

  fn.asPromise = (sessionID, passphrase) => {
    return new Promise((resolve) => fn(sessionID, passphrase, resolve));
  };

  return fn;
};
