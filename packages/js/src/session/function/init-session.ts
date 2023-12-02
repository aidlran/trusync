import type { WorkerDispatch } from '../../worker/worker-dispatch.js';
import type { UseSessionCallback } from './use-session.js';

export function initSession(
  workerDispatch: Pick<WorkerDispatch, 'postToOne'>,
  useSession: (sessionID: number, pin: string, callback?: UseSessionCallback) => unknown,
  pin: string,
  metadata?: unknown,
  callback?: UseSessionCallback,
): void {
  workerDispatch.postToOne(
    {
      action: 'initSession',
      payload: { pin, metadata },
    },
    (result) => useSession(result.payload.sessionID, pin, callback),
  );
}
