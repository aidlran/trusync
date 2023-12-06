import { WorkerJobError } from '../../error/worker-job-error.js';
import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { ActiveSessionObservable, AllSessionsObservable } from '../types.js';

export type ImportIdentityCallback = (error?: WorkerJobError<'importIdentity'>) => unknown;

function error(message: string, callback?: ImportIdentityCallback): void {
  callback && callback(new WorkerJobError('importIdentity', message));
}

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
    return error(`Address '${address}' is already imported.`, callback);
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
          forgetIdentity(address, () => error(result.error ?? 'Unknown error.', callback));
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
