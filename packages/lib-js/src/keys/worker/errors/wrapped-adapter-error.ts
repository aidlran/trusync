import { KeyManagerError } from '../../shared/errors/key-manager.error.js';

export class WrappedAdapterError extends KeyManagerError {
  constructor(
    readonly adapterName: string,
    readonly fnName: string,
    message?: string,
  ) {
    super(`${adapterName}: ${fnName} failed: ${message}.`);
  }
}
