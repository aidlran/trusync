import type { Action } from '../types/action';
import { KeyManagerError } from './key-manager.error';

export class KeyManagerActionError<T extends Action> extends KeyManagerError {
  constructor(
    readonly action: T,
    errorMessage: string,
  ) {
    super(`${action} failed: ${errorMessage}`);
  }
}
