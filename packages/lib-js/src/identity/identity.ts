import type { Data } from '../data/data';
import type { KeyManager } from '../keys/primary/classes/key-manager';
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
   * @param {string} address The address string of the identity.
   * @param {Uint8Array} secret The secret key of the identity as raw bytes.
   * @returns {Promise<void>} A Promise that resolves on success.
   */
  async import(address: string, secret: Uint8Array): Promise<void> {
    await this.keyManager.importIdentity(address, secret);
    this.emitChange();
  }
}
