import type { Action } from '../worker/types/action.js';
import { TrusyncError } from './trusync-error.js';

export class WorkerJobError<T extends Action> extends TrusyncError {
  constructor(
    readonly action: T,
    errorMessage: string,
  ) {
    super(`worker '${action}' job failed: ${errorMessage}`);
  }
}
