import type {
  EncryptPrivateKeyRequest,
  EncryptPrivateKeyResult,
  GenerateKeyPairRequest,
  GenerateKeyPairResult,
  ImportKeyRequest,
  ImportKeysResult,
} from '../../../shared/interfaces/payloads/index.js';
import { NS } from './ns.js';

export class KeysNS extends NS {
  protected keyIDs = new Array<string>();

  get importedKeyIDs() {
    return structuredClone(this.keyIDs);
  }

  async encryptPrivateKey(payload: EncryptPrivateKeyRequest): Promise<EncryptPrivateKeyResult> {
    return (await this.postJobSingle({ action: 'encryptPrivateKey', payload })).payload;
  }

  async generateKeyPair(payload?: GenerateKeyPairRequest): Promise<GenerateKeyPairResult> {
    return (await this.postJobSingle({ action: 'generateKeyPair', payload })).payload;
  }

  import(...requests: ImportKeyRequest[]): Promise<ImportKeysResult[]> {
    // TODO: if failed for some workers only,
    // send `forgetKey` job to roll operation back and throw error
    // this is a problem as they would be out of sync

    // if failed for ALL workers, just raise a warning about the key being unavailable

    return Promise.all(
      requests.map((payload) =>
        this.postJobAll({ action: 'importKeyPair', payload }).then((result) => {
          this.keyIDs = this.keyIDs.concat(result[0].payload.keyIDs);
          return result[0].payload;
        }),
      ),
    );
  }
}
