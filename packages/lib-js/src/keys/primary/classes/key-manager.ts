import { KeyManagerActionError } from '../../shared/errors/key-manager-action.error';
import type * as Payload from '../../shared/interfaces/payloads';
import type { Action, Request, Result } from '../../shared/types';
import { ManagedWorker } from './managed-worker';

export class KeyManager {
  private readonly cluster: ManagedWorker[];

  private readonly _importedAddresses = new Array<string>();

  private currentWorker = 0;

  constructor(workerConstructor: () => Worker) {
    this.cluster = Array.from(
      // TODO: test this on Safari
      { length: Math.ceil(navigator.hardwareConcurrency / 2) },
      () => new ManagedWorker(workerConstructor),
    );
  }

  get importedAddresses() {
    return structuredClone(this._importedAddresses);
  }

  private getNextWorker(): number {
    // TODO: implement load balancing
    if (++this.currentWorker >= this.cluster.length) {
      return (this.currentWorker = 0);
    } else {
      return this.currentWorker;
    }
  }

  private postToOne<T extends Action>(request: Request<T>): Promise<Result<T>> {
    return this.cluster[this.getNextWorker()].postJob(request);
  }

  private postToAll<T extends Action>(request: Request<T>): Promise<Result<T>[]> {
    return Promise.all(this.cluster.map((worker) => worker.postJob(request)));
  }

  // async asymmetricDecrypt(payload: Payload.AsymmetricCryptPayload): Promise<Payload.CryptResult> {
  //   return (await this.postToOne({ action: 'asymmetricDecrypt', payload })).payload;
  // }

  // async asymmetricEncrypt(
  //   payload: Payload.AsymmetricCryptPayload,
  // ): Promise<Payload.AsymmetricCryptPayload> {
  //   return (await this.postToOne({ action: 'asymmetricEncrypt', payload })).payload;
  // }

  // // TODO: review types
  // destroySession() {
  //   this._importedKeys.length = 0;
  //   return this.postToAll({ action: 'destroySession' });
  // }

  // async encryptPrivateKey(
  //   payload: Payload.EncryptPrivateKeyRequest,
  // ): Promise<Payload.EncryptPrivateKeyResult> {
  //   return (await this.postToOne({ action: 'encryptPrivateKey', payload })).payload;
  // }

  // async exportSession(): Promise<Payload.ExportSessionResult> {
  //   return (await this.postToOne({ action: 'exportSession' })).payload;
  // }

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

  // async generateKeyPair(
  //   payload?: Payload.GenerateKeyPairRequest,
  // ): Promise<Payload.GenerateKeyPairResult> {
  //   return (await this.postToOne({ action: 'generateKeyPair', payload })).payload;
  // }

  // async hybridDecrypt(payload: Payload.HybridDecryptRequest): Promise<Payload.CryptResult> {
  //   return (await this.postToOne({ action: 'hybridDecrypt', payload })).payload;
  // }

  // async hybridEncrypt(
  //   payload: Payload.AsymmetricCryptPayload,
  // ): Promise<Payload.HybridEncryptResult> {
  //   return (await this.postToOne({ action: 'hybridEncrypt', payload })).payload;
  // }

  // async hybridShareKey(
  //   payload: Payload.HybridShareKeyRequest,
  // ): Promise<Payload.AsymmetricCryptPayload> {
  //   return (await this.postToOne({ action: 'hybridShareKey', payload })).payload;
  // }

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
  }

  // async importSession<T extends boolean>(
  //   request: Payload.ImportSessionRequest<T>,
  // ): Promise<Payload.ImportSessionResult<T>> {
  //   const [{ payload }] = await this.postToAll({
  //     action: 'importSession',
  //     payload: { ...request, reexport: false },
  //   });

  //   this._importedKeys.push(...payload.importedKeyIDs);

  //   if (request.reexport) {
  //     // TODO: scrap this, or do within worker
  //     return {
  //       ...payload,
  //       ...(await this.exportSession()),
  //       reexported: true,
  //     } as Payload.ImportSessionResult<T>;
  //   } else {
  //     return payload as Payload.ImportSessionResult<T>;
  //   }
  // }

  // async symmetricDecrypt(payload: Payload.SymmetricCryptPayload): Promise<Payload.CryptResult> {
  //   return (await this.postToOne({ action: 'symmetricDecrypt', payload })).payload;
  // }

  // async symmetricEncrypt(payload: Payload.SymmetricCryptPayload): Promise<Payload.CryptResult> {
  //   return (await this.postToOne({ action: 'symmetricEncrypt', payload })).payload;
  // }
}
