import type { Request } from './types/request.js';
import type { Result } from './types/result.js';
import { CLUSTER_SIZE_DEFAULT } from './worker-defaults.js';
import type {
  JobCallback,
  PublicAction,
  WorkerInstance,
  WorkerInstanceConstructor,
} from './worker-instance.js';

export type WorkerPostMultiResultCallback<T extends PublicAction = PublicAction> = (
  results: Result<T>[],
) => unknown;

export interface WorkerDispatch {
  postToAll: <T extends PublicAction = PublicAction>(
    request: Request<T>,
    callback?: WorkerPostMultiResultCallback<T>,
  ) => unknown;
  postToOne: <T extends PublicAction = PublicAction>(
    request: Request<T>,
    callback?: JobCallback<T>,
  ) => unknown;
}

export function workerDispatch(
  workerInstanceConstructor: WorkerInstanceConstructor,
  clusterSize = CLUSTER_SIZE_DEFAULT,
): WorkerDispatch {
  const cluster = new Array<WorkerInstance>();
  for (let i = 0; i < clusterSize; i++) {
    cluster.push(workerInstanceConstructor());
  }
  return {
    /**
     * Dispatches a job to all workers in the cluster.
     *
     * @param request The request to be sent.
     * @param callback An optional callback to execute on the results returned from the workers.
     */
    postToAll<T extends PublicAction>(
      // TODO: Further restrict T to specific actions that can be done with one
      request: Request<T>,
      callback?: WorkerPostMultiResultCallback<T>,
    ): void {
      const onResult = callback
        ? (() => {
            let responseCount = 0;
            const responses = new Array<Result<T>>();
            return (result: Result<T>): void => {
              responses.push(result);
              if (++responseCount === clusterSize) {
                callback(responses);
              }
            };
          })()
        : undefined;
      for (const worker of cluster) {
        worker(request, onResult);
      }
    },

    /**
     * Dispatches a job to one of the workers in the cluster. Jobs are distributed using a simple
     * round-robin strategy.
     *
     * @param request The request to be sent.
     * @param callback An optional callback to execute on the result returned from the worker.
     */
    postToOne<T extends PublicAction>(
      // TODO: Further restrict T to specific actions that must be done with all
      request: Request<T>,
      callback?: JobCallback<T>,
    ): void {
      // TODO: swappable load balancing algorithms
      const worker = cluster.shift()!;
      cluster.push(worker);
      worker(request, callback);
    },
  };
}
