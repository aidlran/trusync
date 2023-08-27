import type {
  AsymmetricCryptPayload,
  CryptResult,
  HybridDecryptRequest,
  HybridEncryptResult,
  HybridShareKeyRequest,
} from '../../../shared/interfaces/payloads/index.js';
import { NS } from './ns.js';

export class HybridNS extends NS {
  async decrypt(payload: HybridDecryptRequest): Promise<CryptResult> {
    return (await this.postJobSingle({ action: 'hybridDecrypt', payload })).payload;
  }

  async encrypt(payload: AsymmetricCryptPayload): Promise<HybridEncryptResult> {
    return (await this.postJobSingle({ action: 'hybridEncrypt', payload })).payload;
  }

  async shareKey(payload: HybridShareKeyRequest): Promise<AsymmetricCryptPayload> {
    return (await this.postJobSingle({ action: 'hybridShareKey', payload })).payload;
  }
}
