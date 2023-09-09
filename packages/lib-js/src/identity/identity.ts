import { Data } from '../data/data.js';
import { KMS } from '../keys/configured-kms.js';

export class Identity {
  private _publicKey?: string;
  onChange?: (identity: Identity) => void;

  constructor(
    private readonly data: Data,
    private readonly keyManagement: KMS,
  ) {}

  get publicKey(): string | undefined {
    return this._publicKey;
  }

  private emitChange(): void {
    if (this.onChange) {
      this.onChange(this);
    }
  }

  async create(): Promise<{ privateKey: string; publicKey: string }> {
    const keyPair = await this.keyManagement.keys.generateKeyPair();
    await this.data.putNamedJSON({ publicKey: keyPair.publicKey }, keyPair.publicKey);
    await this.keyManagement.keys.import({
      keyID: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    });
    this._publicKey = keyPair.publicKey;
    this.emitChange();
    return keyPair;
  }
}
