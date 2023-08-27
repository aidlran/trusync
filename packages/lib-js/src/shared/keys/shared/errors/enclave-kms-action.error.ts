import type { Action } from '../types/action.js';
import { EnclaveKmsError } from './enclave-kms.error.js';

export class EnclaveKmsActionError<T extends Action> extends EnclaveKmsError {
  constructor(
    readonly action: T,
    errorMessage: string,
  ) {
    super(`${action} failed: ${errorMessage}`);
  }
}
