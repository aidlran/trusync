import { EnclaveKmsActionError } from '../../shared/errors/enclave-kms-action.error.js';
import type { Action, Job } from '../../shared/types/index.js';
import type { KeyPair } from '../interfaces/key-pair.js';

export class KeyPairMap<PrivateKeyType, PublicKeyType>
  implements Iterable<[string, KeyPair<PrivateKeyType, PublicKeyType>]>
{
  private keyPairMap = new Map<string, KeyPair<PrivateKeyType, PublicKeyType>>();

  *[Symbol.iterator](): Iterator<[string, KeyPair<PrivateKeyType, PublicKeyType>]> {
    for (const entry of this.keyPairMap.entries()) {
      yield entry;
    }
  }

  clear(): void {
    this.keyPairMap = new Map<string, KeyPair<PrivateKeyType, PublicKeyType>>();
  }

  get(id: string, job: Job<Action>): KeyPair<PrivateKeyType, PublicKeyType> {
    const keyPair = this.keyPairMap.get(id);

    if (!keyPair) {
      throw new EnclaveKmsActionError(job.action, `Key pair with ID ${id} not found`);
    }

    return keyPair;
  }

  getPrivateKey(id: string, job: Job<Action>): PrivateKeyType {
    const { privateKey } = this.get(id, job);

    if (!privateKey) {
      throw new EnclaveKmsActionError(
        job.action,
        `We do not have the private key for key pair ID ${id}`,
      );
    }

    return privateKey;
  }

  getPublicKey(id: string, job: Job<Action>): PublicKeyType {
    return this.get(id, job).publicKey;
  }

  set(id: string, keyPair: KeyPair<PrivateKeyType, PublicKeyType>): void {
    this.keyPairMap.set(id, keyPair);
  }
}
