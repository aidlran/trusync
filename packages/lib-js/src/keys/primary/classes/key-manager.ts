import type * as Payload from '../../shared/interfaces/payloads/index.js';
import type { Action, Request, Result } from '../../shared/types/index.js';
import { ManagedWorker } from './managed-worker.js';

export class KeyManager {
  private readonly cluster: ManagedWorker[] = Array.from(
    // TODO: test this on Safari
    { length: Math.ceil(navigator.hardwareConcurrency / 2) },
    () => new ManagedWorker(),
  );

  private readonly _importedKeys = new Array<string>();

  private currentWorker = 0;

  get importedKeys() {
    return structuredClone(this._importedKeys);
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

  async asymmetricDecrypt(payload: Payload.AsymmetricCryptPayload): Promise<Payload.CryptResult> {
    return (await this.postToOne({ action: 'asymmetricDecrypt', payload })).payload;
  }

  async asymmetricEncrypt(
    payload: Payload.AsymmetricCryptPayload,
  ): Promise<Payload.AsymmetricCryptPayload> {
    return (await this.postToOne({ action: 'asymmetricEncrypt', payload })).payload;
  }

  // TODO: review types
  destroySession() {
    this._importedKeys.length = 0;
    return this.postToAll({ action: 'destroySession' });
  }

  async encryptPrivateKey(
    payload: Payload.EncryptPrivateKeyRequest,
  ): Promise<Payload.EncryptPrivateKeyResult> {
    return (await this.postToOne({ action: 'encryptPrivateKey', payload })).payload;
  }

  async exportSession(): Promise<Payload.ExportSessionResult> {
    return (await this.postToOne({ action: 'exportSession' })).payload;
  }

  async generateKeyPair(
    payload?: Payload.GenerateKeyPairRequest,
  ): Promise<Payload.GenerateKeyPairResult> {
    return (await this.postToOne({ action: 'generateKeyPair', payload })).payload;
  }

  async hybridDecrypt(payload: Payload.HybridDecryptRequest): Promise<Payload.CryptResult> {
    return (await this.postToOne({ action: 'hybridDecrypt', payload })).payload;
  }

  async hybridEncrypt(
    payload: Payload.AsymmetricCryptPayload,
  ): Promise<Payload.HybridEncryptResult> {
    return (await this.postToOne({ action: 'hybridEncrypt', payload })).payload;
  }

  async hybridShareKey(
    payload: Payload.HybridShareKeyRequest,
  ): Promise<Payload.AsymmetricCryptPayload> {
    return (await this.postToOne({ action: 'hybridShareKey', payload })).payload;
  }

  async importKeyPair(payload: Payload.ImportKeyRequest): Promise<Payload.ImportKeysResult> {
    // TODO: forgetKeyPair job to roll back changes on error and ensure cluster is in sync
    const results = await this.postToAll({ action: 'importKeyPair', payload });
    this._importedKeys.push(payload.publicKey);
    return results[0].payload;
  }

  async importSession<T extends boolean>(
    request: Payload.ImportSessionRequest<T>,
  ): Promise<Payload.ImportSessionResult<T>> {
    const [{ payload }] = await this.postToAll({
      action: 'importSession',
      payload: { ...request, reexport: false },
    });

    this._importedKeys.push(...payload.importedKeyIDs);

    if (request.reexport) {
      // TODO: scrap this, or do within worker
      return {
        ...payload,
        ...(await this.exportSession()),
        reexported: true,
      } as Payload.ImportSessionResult<T>;
    } else {
      return payload as Payload.ImportSessionResult<T>;
    }
  }

  async symmetricDecrypt(payload: Payload.SymmetricCryptPayload): Promise<Payload.CryptResult> {
    return (await this.postToOne({ action: 'symmetricDecrypt', payload })).payload;
  }

  async symmetricEncrypt(payload: Payload.SymmetricCryptPayload): Promise<Payload.CryptResult> {
    return (await this.postToOne({ action: 'symmetricEncrypt', payload })).payload;
  }
}