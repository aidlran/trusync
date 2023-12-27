import type {
  CreateSessionRequest,
  CreateSessionResult,
  LoadSessionResult,
} from '../../worker/interface/payload/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type {
  ActiveSession,
  ActiveSessionObservable,
  AllSessionsObservable,
  InactiveSession,
} from '../types.js';

export const constructCreateSession = <T>(
  worker: WorkerDispatch,
  activeSessions: ActiveSessionObservable,
  allSessions: AllSessionsObservable,
) => {
  const createSession = (
    options: CreateSessionRequest<T>,
    callback?: (result: CreateSessionResult & LoadSessionResult<T>) => unknown,
  ): void => {
    worker.postToOne({ action: 'session.create', payload: options }, ({ payload }) => {
      const mnemonic = payload.mnemonic;

      const session: InactiveSession<T> = {
        id: payload.id,
        active: false,
      };

      allSessions.update((all) => {
        all[payload.id] = session;
        return all;
      });

      worker.postToAll(
        {
          action: 'session.load',
          payload: { id: payload.id, passphrase: options.passphrase },
        },
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

          activeSessions.update(() => session);

          if (callback) {
            callback({
              id: payload.id,
              metadata: payload.metadata as T,
              mnemonic,
            });
          }
        },
      );
    });
  };

  createSession.asPromise = (options: CreateSessionRequest<T>) => {
    return new Promise<CreateSessionResult>((resolve) => createSession(options, resolve));
  };

  return createSession;
};
