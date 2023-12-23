import type {
  CreateSessionRequest,
  CreateSessionResult,
} from '../../worker/interface/payload/index.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { JobCallback } from '../../worker/worker-instance.js';
import type { ActiveSession, ActiveSessionObservable, AllSessionsObservable } from '../types.js';

export const constructCreateSession = <T>(
  { postToOne }: Pick<WorkerDispatch, 'postToOne'>,
  activeSession: ActiveSessionObservable,
  allSessions: AllSessionsObservable,
) => {
  const createSession = (
    options: CreateSessionRequest<T>,
    callback?: (result: CreateSessionResult) => unknown,
  ): void => {
    const handler: JobCallback<'session.create'> = ({ payload }) => {
      const session: ActiveSession<T> = {
        id: payload.id,
        active: true,
      };
      allSessions.update((all) => {
        all[payload.id] = session;
        return all;
      });
      activeSession.update(() => session);
      if (callback) callback(payload);
    };

    postToOne({ action: 'session.create', payload: options }, handler);
  };

  createSession.asPromise = (options: CreateSessionRequest<T>) => {
    return new Promise<CreateSessionResult>((resolve) => createSession(options, resolve));
  };

  return createSession;
};
