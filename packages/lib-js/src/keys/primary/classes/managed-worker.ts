import type { Action, CompletedJob, FailedJob, Request, Result } from '../../shared/types/index.js';

export class ManagedWorker {
  private readonly worker: Worker;

  private pendingJobs = new Map<number, (result: Result<Action>) => void>();

  private jobCounter = 0;

  constructor(workerConstructor: () => Worker) {
    this.worker = workerConstructor();
  }

  postJob<T extends Action>(payload: Request<T>): Promise<Result<T>> {
    return new Promise<Result<T>>((resolve, reject) => {
      const jobID = this.jobCounter++;

      this.pendingJobs.set(jobID, function (result) {
        result.ok ? resolve(result as Result<T>) : reject(result as FailedJob<T>);
      });

      this.worker.postMessage({ jobID, ...payload });

      this.worker.onmessage = (event: MessageEvent<CompletedJob<Action>>): void => {
        const { jobID, ...result } = event.data;

        const callback = this.pendingJobs.get(jobID);
        this.pendingJobs.delete(jobID);

        if (callback) {
          callback(result);
        } else {
          console.warn(
            `truSync key manager: ${
              event.data.action
            } Job [${jobID}]: finished with status: ${JSON.stringify({
              ok: event.data.ok,
            })} but no callback found.`,
          );
        }
      };
    });
  }
}
