import type { Action } from '../types/action.js';
import { KeyManagerError } from './key-manager.error.js';

export class KeyManagerActionError<T extends Action> extends KeyManagerError {
  constructor(
    readonly action: T,
    errorMessage: string,
  ) {
    super(`${action} failed: ${errorMessage}`);
  }
}
