import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { ActiveSessionObservable, AllSessionsObservable } from '../types.js';

export type ImportIdentityCallback = (error?: Error) => unknown;

export function importIdentity(
  workerDispatch: Pick<WorkerDispatch, 'postToAll' | 'postToOne'>,
  sessionsObservable: AllSessionsObservable,
  activeSessionObservable: ActiveSessionObservable,
  forgetIdentity: (address: string, callback?: () => unknown) => unknown,
  address: string,
  secret: Uint8Array,
  callback?: ImportIdentityCallback,
) {
  if (activeSessionObservable.get()?.identities.has(address)) {
    if (callback) callback(new Error(`Address '${address}' already imported`));
    return;
  }
  workerDispatch.postToAll(
    {
      action: 'importIdentity',
      payload: {
        address,
        secret,
      },
    },
    (results) => {
      for (const result of results) {
        if (!result.ok) {
          forgetIdentity(address, () => callback && callback(new Error(result.error)));
          return;
        }
      }
      activeSessionObservable.update((activeSession) => {
        if (activeSession) {
          activeSession.identities.add(address);
          sessionsObservable.emit();
          return activeSession;
        } else {
          return {
            active: true,
            identities: new Set([address]),
          };
        }
      });
      callback && callback();
      if (activeSessionObservable.get()!.id) {
        workerDispatch.postToOne({ action: 'saveSession' });
      }
    },
  );
}
