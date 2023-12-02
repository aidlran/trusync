import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { ActiveSessionObservable, AllSessionsObservable } from '../types.js';

export function forgetIdentity(
  workerDispatch: Pick<WorkerDispatch, 'postToAll'>,
  sessionsObservable: AllSessionsObservable,
  activeSessionObservable: ActiveSessionObservable,
  address: string,
  callback?: () => unknown,
) {
  workerDispatch.postToAll({ action: 'forgetIdentity', payload: { address } }, () => {
    if (activeSessionObservable.get()) {
      activeSessionObservable.update((activeSession) => {
        const session = activeSession;
        session!.identities.delete(address);
        sessionsObservable.emit();
        return session;
      });
    }
    callback && callback();
  });
}
