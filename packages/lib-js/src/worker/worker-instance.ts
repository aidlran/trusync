import type { Action, CompletedJob, Request, Result } from '../keys/shared/types/index.js';

export type PublicAction = Exclude<Action, 'workerReady'>;

export type JobCallback<T extends PublicAction = PublicAction> = (result: Result<T>) => unknown;

/**
 * A function that POSTs a request message to the web worker and runs the callback with the
 * response.
 */
export type WorkerInstance = <T extends PublicAction>(
  request: Request<T>,
  callback?: JobCallback<T>,
) => void;

export type WorkerInstanceConstructor = (...args: never[]) => WorkerInstance;

/**
 * @param workerConstructor A function that returns a web worker.
 * @returns A function that creates a `WorkerInstance`.
 */
export function workerInstance(workerConstructor: () => Worker): WorkerInstanceConstructor {
  return function (): WorkerInstance {
    let readyCallbacks: Set<() => void> | undefined = new Set();
    let jobCounter = 0;
    const jobCallbacks: Record<number, JobCallback | undefined> = {};
    const worker = workerConstructor();

    worker.onmessage = function (event: MessageEvent<CompletedJob<Action>>) {
      if (event.data.action === 'workerReady') {
        if (readyCallbacks) {
          for (const callback of readyCallbacks) {
            // TODO: why is this being flagged?
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            callback();
          }
          readyCallbacks = undefined;
        }
        return;
      } else {
        // const actionCallbacks = jobCallbacks[event.data.action];
        // if (actionCallbacks) {
        jobCallbacks[event.data.jobID]?.(event.data as Result<PublicAction>);
        delete jobCallbacks[event.data.jobID];
        // }
      }
    };

    return function <T extends PublicAction>(request: Request<T>, callback?: JobCallback<T>) {
      function post() {
        jobCallbacks[jobCounter++] = callback as JobCallback | undefined;
        // TODO: don't use spread operator
        worker.postMessage({ ...request, jobID: jobCounter });
      }
      if (readyCallbacks) readyCallbacks.add(post);
      else post();
    };
  };
}
