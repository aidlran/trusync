import { KeyManagerActionError } from '../../shared/errors/key-manager-action.error.js';
import type { GenerateIdentityResult } from '../../shared/interfaces/payloads/index.js';
import type { Action, Request, Result } from '../../shared/types/index.js';
import { ManagedWorker } from './managed-worker.js';

/** @deprecated Use `WORKER_DISPATCH`. */
export class KeyManager {
  /** @deprecated Use `WORKER_DISPATCH`. */
  private readonly cluster: ManagedWorker[];

  // TODO: use a set
  private readonly _importedAddresses = new Array<string>();

  private _activeSession: number | undefined;
  private currentWorkerIndex = 0;

  constructor(workerConstructor: () => Worker) {
    this.cluster = Array.from(
      // TODO: test this on Safari
      { length: Math.min(Math.max(Math.floor(navigator.hardwareConcurrency / 2), 1), 4) },
      () => new ManagedWorker(workerConstructor),
    );
  }

  get activeSession(): number | undefined {
    return this._activeSession;
  }

  get importedAddresses(): string[] {
    return structuredClone(this._importedAddresses);
  }

  // TODO: further restrict T to specific actions
  /** @deprecated Use `WORKER_DISPATCH`. */
  private postToOne<T extends Action>(request: Request<T>): Promise<Result<T>> {
    // TODO: load balancing
    if (++this.currentWorkerIndex >= this.cluster.length) {
      this.currentWorkerIndex = 0;
    }
    return this.cluster[this.currentWorkerIndex].postJob(request);
  }

  // TODO: further restrict T to specific actions
  /** @deprecated Use `WORKER_DISPATCH`. */
  private postToAll<T extends Action>(request: Request<T>): Promise<Result<T>[]> {
    return Promise.all(this.cluster.map((worker) => worker.postJob(request)));
  }

  async forgetIdentity(address: string): Promise<void> {
    await this.postToAll({
      action: 'forgetIdentity',
      payload: { address },
    });
    const foundIndex = this._importedAddresses.findIndex((value) => value === address);
    if (foundIndex > -1) {
      this._importedAddresses.splice(foundIndex, 1);
    }
  }

  async generateIdentity(): Promise<GenerateIdentityResult> {
    return (await this.postToOne({ action: 'generateIdentity' })).payload;
  }

  async importIdentity(address: string, secret: Uint8Array): Promise<void> {
    if (this._importedAddresses.find((importedAddress) => importedAddress === address)) {
      throw new KeyManagerActionError(
        'importIdentity',
        `Address '${address}' is already imported.`,
      );
    }
    const results = await this.postToAll({
      action: 'importIdentity',
      payload: {
        address,
        secret,
      },
    });
    const failedResult = results.find((result) => !result.ok);
    if (failedResult) {
      await this.forgetIdentity(address);
      throw new KeyManagerActionError('importIdentity', failedResult.error ?? 'Unknown error.');
    }
    this._importedAddresses.push(address);
    if (this.activeSession) {
      await this.postToOne({ action: 'saveSession' });
    }
  }

  async reset(): Promise<void> {
    await this.postToAll({ action: 'reset' });
    this._importedAddresses.length = 0;
    this._activeSession = undefined;
  }
}
