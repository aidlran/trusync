import type { Data } from '../data/data.js';
import type { KeyManager } from '../keys/primary/classes/key-manager.js';
import type { GenerateIdentityResult } from '../keys/shared/interfaces/payloads/results/generate-identity-result.js';

export class Identity {
  onChange?: (identity: Identity) => void;

  constructor(
    private readonly data: Data,
    /** @deprecated Use `WORKER_DISPATCH`. */
    private readonly keyManager: KeyManager,
  ) {}

  get activeSession(): number | undefined {
    return this.keyManager.activeSession;
  }

  get importedAddresses(): string[] {
    return this.keyManager.importedAddresses;
  }

  private emitChange(): void {
    if (this.onChange) {
      this.onChange(this);
    }
  }

  /** Generate a new identity. */
  async generate(): Promise<GenerateIdentityResult> {
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
   * Forget an imported identity.
   *
   * @param {string} address The address string of the identity.
   * @returns {Promise<void>} A Promise that resolves on success.
   */
  async forget(address: string): Promise<void> {
    await this.keyManager.forgetIdentity(address);
    this.emitChange();
  }

  /**
   * Import an existing identity.
   *
   * @param {string} address The address string of the identity.
   * @param {Uint8Array} secret The secret key of the identity as raw bytes.
   * @returns {Promise<void>} A Promise that resolves on success.
   */
  async import(address: string, secret: Uint8Array): Promise<void> {
    await this.keyManager.importIdentity(address, secret);
    this.emitChange();
  }

  async reset(): Promise<void> {
    await this.keyManager.reset();
    this.emitChange();
  }
}
