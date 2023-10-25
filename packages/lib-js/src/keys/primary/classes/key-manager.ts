import { KeyManagerActionError } from '../../shared/errors/key-manager-action.error';
import type * as Payload from '../../shared/interfaces/payloads';
import type { Action, Request, Result } from '../../shared/types';
import { ManagedWorker } from './managed-worker';

export class KeyManager {
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
  private postToOne<T extends Action>(request: Request<T>): Promise<Result<T>> {
    // TODO: load balancing
    if (++this.currentWorkerIndex >= this.cluster.length) {
      this.currentWorkerIndex = 0;
    }
    return this.cluster[this.currentWorkerIndex].postJob(request);
  }

  // TODO: further restrict T to specific actions
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

  async generateIdentity(): Promise<Payload.GenerateIdentityResult> {
    return (await this.postToOne({ action: 'generateIdentity' })).payload;
  }

  async getSessions<T>(): Promise<Payload.GetSessionsResult<T>> {
    // TODO: this can be done on main thread. Measure latency to see if it's better done here.
    return (await this.postToOne({ action: 'getSessions' }))
      .payload as Payload.GetSessionsResult<T>;
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

  async initSession<T>(pin: string, metadata?: T): Promise<void> {
    const initResult = await this.postToOne({
      action: 'initSession',
      payload: {
        pin,
        metadata,
      },
    });

    await this.useSession(initResult.payload.sessionID, pin);
  }

  async reset(): Promise<void> {
    await this.postToAll({ action: 'reset' });
    this._importedAddresses.length = 0;
    this._activeSession = undefined;
  }

  async useSession(sessionID: number, pin: string): Promise<void> {
    const results = await this.postToAll({
      action: 'useSession',
      payload: {
        sessionID,
        pin,
      },
    });

    // We need to check result from all workers and ensure they are in sync
    // If one or more of them borked it, roll it back!

    let allImportedAddresses!: Set<string>;
    let firstRun = true;
    let ok = true;

    for (const result of results) {
      const iterationImportedAddresses = new Set<string>(result.payload.importedAddresses);

      if (!result.ok) {
        ok = false;
      }

      if (firstRun) {
        allImportedAddresses = iterationImportedAddresses;
      } else {
        if (ok) {
          ok = allImportedAddresses.size === iterationImportedAddresses.size;
        }

        if (ok) {
          for (const address of iterationImportedAddresses) {
            ok = allImportedAddresses.has(address as string);
            if (!ok) break;
          }
        }

        if (!ok) {
          for (const address of iterationImportedAddresses) {
            allImportedAddresses.add(address as string);
          }
        }
      }

      firstRun = false;
    }

    if (ok) {
      this._importedAddresses.length = 0;
      for (const address of allImportedAddresses) {
        this._importedAddresses.push(address as string);
      }
      this._activeSession = sessionID;
    } else {
      await Promise.all(
        [...allImportedAddresses].map((address: string) => this.forgetIdentity(address)),
      );
      throw new KeyManagerActionError('useSession', 'One or more workers were out of sync.');
    }
  }
}
