import type { Data } from '../data/data';
import type { KeyManager } from '../keys/primary/classes/key-manager.js';

export class Identity {
  onChange?: (identity: Identity) => void;

  constructor(
    private readonly data: Data,
    private readonly keyManager: KeyManager,
  ) {}

  get publicKeys(): string[] {
    // Expose a shallow clone
    return this.keyManager.importedKeys;
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
    const keyPair = await this.keyManager.generateKeyPair();
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
    await this.keyManager.importKeyPair({
      keyID: publicKey,
      privateKey,
      publicKey,
    });
    this.emitChange();
  }
}
