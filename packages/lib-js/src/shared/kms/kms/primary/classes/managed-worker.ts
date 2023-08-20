import type { Action, CompletedJob, FailedJob, Request, Result } from '../../shared/types/index.js';

export class ManagedWorker {
  constructor(private readonly worker: Worker) {}

  private pendingJobs = new Map<number, (result: Result<Action>) => void>();

  private jobCounter = 0;

  postJob<A extends Action>(payload: Request<A>): Promise<Result<A>> {
    return new Promise<Result<A>>((resolve, reject) => {
      const jobID = this.jobCounter++;

      this.pendingJobs.set(jobID, function (result) {
        result.ok ? resolve(result as Result<A>) : reject(result as FailedJob<A>);
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
            `Enclave KMS: Job [${jobID}]: finished with status: ${JSON.stringify({
              ok: event.data.ok,
            })} but no callback found.`,
          );
        }
      };
    });
  }
}
