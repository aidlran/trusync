import { Data } from '../data/data.js';
import { KMS } from '../keys/configured-kms.js';

export class Identity {
  private readonly _publicKeys = new Array<string>();
  onChange?: (identity: Identity) => void;

  constructor(
    private readonly data: Data,
    private readonly keyManagement: KMS,
  ) {}

  get publicKeys(): string[] {
    // Expose a shallow clone
    return [...this._publicKeys];
  }

  private emitChange(): void {
    if (this.onChange) {
      this.onChange(this);
    }
  }

  /**
   * Create a new identity.
   * @param immediateImport Whether to immediately import the identity. Defaults to `true`.
   */
  async create(immediateImport = true): Promise<{ privateKey: string; publicKey: string }> {
    const keyPair = await this.keyManagement.keys.generateKeyPair();
    if (immediateImport) {
      await this.import(keyPair.publicKey, keyPair.privateKey);
    }
    await this.data.putNamedJSON({ publicKey: keyPair.publicKey }, keyPair.publicKey);
    return keyPair;
  }

  /**
   * Import an existing identity.
   */
  async import(publicKey: string, privateKey: string): Promise<void> {
    await this.keyManagement.keys.import({
      keyID: publicKey,
      privateKey,
      publicKey,
    });
    this._publicKeys.push(publicKey);
    this.emitChange();
  }
}
