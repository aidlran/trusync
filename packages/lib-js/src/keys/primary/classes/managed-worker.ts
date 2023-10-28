import type { Action, CompletedJob, FailedJob, Request, Result } from '../../shared/types/index.js';

/** @deprecated Use `WORKER_DISPATCH`. */
export class ManagedWorker {
  private readonly worker: Worker;
  private readonly pendingJobs = new Map<number, (result: Result<Action>) => void>();
  private ready = false;
  private readonly readyPromise = new Promise<void>((resolve) => {
    const wait = () =>
      setTimeout(() => {
        if (this.ready) resolve();
        else wait();
      }, 10);
    wait();
  });
  private jobCounter = 0;

  constructor(workerConstructor: () => Worker) {
    this.worker = workerConstructor();

    this.worker.onmessage = (event: MessageEvent<CompletedJob<Action>>): void => {
      const { jobID, ...result } = event.data;

      if (!this.ready && event.data.action === 'workerReady') {
        this.ready = true;
        return;
      }

      const callback = this.pendingJobs.get(jobID);
      this.pendingJobs.delete(jobID);

      if (callback) {
        callback(result);
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `truSync key manager: ${
            event.data.action
          } Job [${jobID}]: finished with status: ${JSON.stringify({
            ok: event.data.ok,
          })} but no callback found.`,
        );
      }
    };
  }

  postJob<T extends Action>(payload: Request<T>): Promise<Result<T>> {
    // TODO: replace promise return with pure callbacks to improve performance
    return this.readyPromise.then(
      () =>
        new Promise<Result<T>>((resolve, reject) => {
          const jobID = this.jobCounter++;
          this.pendingJobs.set(jobID, function (result) {
            result.ok ? resolve(result as Result<T>) : reject(result as FailedJob<T>);
          });
          this.worker.postMessage({ jobID, ...payload });
        }),
    );
  }
}
