import type { Data } from '../data/data';
import type { KeyManager } from '../keys/primary/classes/key-manager.js';
import type { GenerateIdentityResult } from '../keys/shared';

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
   */
  async create(): Promise<GenerateIdentityResult> {
    const identity = await this.keyManager.generateIdentity();
    await this.data.putNamedJSON(
      {
        encryption: identity.encryption,
        signing: identity.signing,
      },
      identity.address.value,
    );
    return identity;
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
