import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { ActiveSessionObservable, Session, AllSessionsObservable } from '../types.js';

export const construct = (
  workerDispatch: Pick<WorkerDispatch, 'postToAll'>,
  sessionsObservable: AllSessionsObservable,
  activeSessionObservable: ActiveSessionObservable,
) => {
  const fn = (callback?: () => unknown): void => {
    workerDispatch.postToAll({ action: 'session.clear' }, () => {
      if (activeSessionObservable.get()) {
        activeSessionObservable.update((activeSession) => {
          const session = activeSession as Session;
          session.active = false;
          sessionsObservable.emit();
          return undefined;
        });
      }
      if (callback) callback();
    });
  };

  fn.asPromise = () => new Promise<void>((resolve) => fn(resolve));

  return fn;
};
