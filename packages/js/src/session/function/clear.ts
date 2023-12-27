import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { ActiveSessionObservable, Session, AllSessionsObservable } from '../types.js';

export interface SessionClearFn {
  (callback?: () => unknown): void;
  asPromise(): Promise<void>;
}

export const construct = (
  { postToAll }: Pick<WorkerDispatch, 'postToAll'>,
  sessionsObservable: AllSessionsObservable,
  activeSessionObservable: ActiveSessionObservable,
): SessionClearFn => {
  const fn: SessionClearFn = (callback) => {
    postToAll({ action: 'session.clear' }, () => {
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

  fn.asPromise = () => new Promise(fn);

  return fn;
};
