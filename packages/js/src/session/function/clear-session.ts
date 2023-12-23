import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { ActiveSessionObservable, Session, AllSessionsObservable } from '../types.js';

export function clearSession(
  workerDispatch: Pick<WorkerDispatch, 'postToAll'>,
  sessionsObservable: AllSessionsObservable,
  activeSessionObservable: ActiveSessionObservable,
  callback?: () => unknown,
): void {
  workerDispatch.postToAll({ action: 'session.clear' }, () => {
    if (activeSessionObservable.get()) {
      activeSessionObservable.update((activeSession) => {
        const session = activeSession as Session;
        session.active = false;
        sessionsObservable.emit();
        return undefined;
      });
    }
    callback && callback();
  });
}
