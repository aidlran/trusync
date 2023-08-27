import type { IAdapter } from '../interfaces/adapter.js';
import { AdapterError } from '../errors/adapter-error.js';
import { WrappedAdapterError } from '../errors/wrapped-adapter-error.js';

export class WrappedAdapter<PrivateKeyType, PublicKeyType, SessionKeyType>
  implements IAdapter<PrivateKeyType, PublicKeyType, SessionKeyType>
{
  constructor(private readonly adapter: IAdapter<PrivateKeyType, PublicKeyType, SessionKeyType>) {}

  /** Ensures a promise is always the return value and handles errors. */
  private async wrap<T>(fn: () => T | Promise<T>, fnName: string): Promise<Awaited<T>> {
    try {
      return await fn();
    } catch (e) {
      let errorMessage: string;
      if (e instanceof AdapterError) {
        errorMessage = e.message;
      } else {
        console.error(e);
        errorMessage = 'Unknown error - check logs';
      }
      // Adapters should throw simple error message strings which will be caught and passed along here
      throw new WrappedAdapterError(this.adapter.constructor.name, fnName, errorMessage);
    }
  }

  decryptPrivateKey(privateKey: string, secret: string) {
    return this.wrap(
      () => this.adapter.decryptPrivateKey(privateKey, secret),
      this.decryptPrivateKey.name,
    );
  }

  decryptSessionKey(sessionKey: string, privateKey: PrivateKeyType) {
    return this.wrap(
      () => this.adapter.decryptSessionKey(sessionKey, privateKey),
      this.decryptSessionKey.name,
    );
  }

  decryptWithPrivateKey(payload: string, key: PrivateKeyType) {
    return this.wrap(
      () => this.adapter.decryptWithPrivateKey(payload, key),
      this.decryptWithPrivateKey.name,
    );
  }

  decryptWithSessionKey(payload: string, key: SessionKeyType) {
    return this.wrap(
      () => this.adapter.decryptWithSessionKey(payload, key),
      this.decryptWithSessionKey.name,
    );
  }

  encryptPrivateKey(privateKey: PrivateKeyType, secret: string) {
    return this.wrap(
      () => this.adapter.encryptPrivateKey(privateKey, secret),
      this.encryptPrivateKey.name,
    );
  }

  encryptSessionKey(sessionKey: SessionKeyType, publicKey: PublicKeyType) {
    return this.wrap(
      () => this.adapter.encryptSessionKey(sessionKey, publicKey),
      this.encryptSessionKey.name,
    );
  }

  /** @deprecated */
  encryptWithPrivateKey(payload: string, key: PrivateKeyType) {
    return this.wrap(
      () => this.adapter.encryptWithPrivateKey(payload, key),
      this.encryptWithPrivateKey.name,
    );
  }

  encryptWithPublicKey(payload: string, key: PublicKeyType) {
    return this.wrap(
      () => this.adapter.encryptWithPublicKey(payload, key),
      this.encryptWithPublicKey.name,
    );
  }

  encryptWithSessionKey(payload: string, key: SessionKeyType) {
    return this.wrap(
      () => this.adapter.encryptWithSessionKey(payload, key),
      this.encryptWithSessionKey.name,
    );
  }

  generateKeyPair() {
    return this.wrap(() => this.adapter.generateKeyPair(), this.generateKeyPair.name);
  }

  generatePrivateKey() {
    return this.wrap(() => this.adapter.generatePrivateKey(), this.generatePrivateKey.name);
  }

  generateSessionKey(publicKey: PublicKeyType) {
    return this.wrap(
      () => this.adapter.generateSessionKey(publicKey),
      this.generateSessionKey.name,
    );
  }

  parsePrivateKey(key: string) {
    return this.wrap(() => this.adapter.parsePrivateKey(key), this.parsePrivateKey.name);
  }

  parsePublicKey(key: string) {
    return this.wrap(() => this.adapter.parsePublicKey(key), this.parsePublicKey.name);
  }

  stringifyPrivateKey(key: PrivateKeyType) {
    return this.wrap(() => this.adapter.stringifyPrivateKey(key), this.stringifyPrivateKey.name);
  }

  stringifyPublicKey(key: PublicKeyType) {
    return this.wrap(() => this.adapter.stringifyPublicKey(key), this.stringifyPublicKey.name);
  }

  symmetricDecrypt(payload: string, passphrase: string) {
    return this.wrap(
      () => this.adapter.symmetricDecrypt(payload, passphrase),
      this.symmetricDecrypt.name,
    );
  }

  symmetricEncrypt(payload: string, passphrase: string) {
    return this.wrap(
      () => this.adapter.symmetricEncrypt(payload, passphrase),
      this.symmetricEncrypt.name,
    );
  }
}
