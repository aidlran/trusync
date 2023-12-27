import type {
  ImportSessionRequest,
  LoadSessionResult,
} from '../../worker/interface/payload/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type {
  ActiveSession,
  ActiveSessionObservable,
  AllSessionsObservable,
  InactiveSession,
} from '../types.js';

export const constructImportSession = <T>(
  worker: WorkerDispatch,
  activeSessions: ActiveSessionObservable,
  allSessions: AllSessionsObservable,
) => {
  const importSession = (
    options: ImportSessionRequest<T>,
    callback?: (result: LoadSessionResult<T>) => unknown,
  ): void => {
    worker.postToOne({ action: 'session.import', payload: options }, ({ payload }) => {
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

          if (callback) callback(payload as LoadSessionResult<T>);
        },
      );
    });
  };

  importSession.asPromise = (options: ImportSessionRequest<T>) => {
    return new Promise<LoadSessionResult>((resolve) => importSession(options, resolve));
  };

  return importSession;
};
