import {
  type CompactJWEHeaderParameters,
  type JWK,
  type KeyLike,
  compactDecrypt,
  CompactEncrypt,
  exportJWK,
  generateKeyPair,
  importJWK,
} from 'jose';
import { AdapterError } from '../errors/adapter-error';
import type { IAdapter } from '../interfaces/adapter';

// TODO: review algorithms
// eventually they'll be configurable, but we'll have sensible defaults
// may need extra logic to determine alg of imported keys, etc.

const KEY_ALG = 'ES512';

export class Adapter implements IAdapter<KeyLike, KeyLike, KeyLike> {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  async asymmetricEncrypt(payload: string, key: KeyLike | Uint8Array) {
    return this.encrypt(payload, key, {
      alg: 'ECDH-ES+A256KW',
      enc: 'A256CBC-HS512',
    });
  }

  async decrypt(payload: string, key: KeyLike | Uint8Array) {
    return this.decoder.decode((await compactDecrypt(payload, key)).plaintext);
  }

  async decryptPrivateKey(privateKey: string, secret: string) {
    return await this.parsePrivateKey(await this.symmetricDecrypt(privateKey, secret));
  }

  async decryptSessionKey(sessionKey: string, privateKey: KeyLike) {
    return this.parseKey(await this.decrypt(sessionKey, privateKey));
  }

  decryptWithPrivateKey(payload: string, key: KeyLike | Uint8Array) {
    return this.decrypt(payload, key);
  }

  decryptWithSessionKey(payload: string, key: KeyLike | Uint8Array) {
    return this.decrypt(payload, key);
  }

  async encrypt(
    payload: string,
    key: KeyLike | Uint8Array,
    protectedHeader: CompactJWEHeaderParameters,
  ) {
    return new CompactEncrypt(this.encoder.encode(payload))
      .setProtectedHeader(protectedHeader)
      .encrypt(key);
  }

  async encryptPrivateKey(privateKey: KeyLike, secret: string) {
    return await this.symmetricEncrypt(await this.stringifyPrivateKey(privateKey), secret);
  }

  async encryptSessionKey(sessionKey: KeyLike, publicKey: KeyLike) {
    return this.asymmetricEncrypt(await this.stringifyKey(sessionKey), publicKey);
  }

  encryptWithPrivateKey(payload: string, key: KeyLike | Uint8Array) {
    return this.asymmetricEncrypt(payload, key);
  }

  encryptWithPublicKey(payload: string, key: KeyLike | Uint8Array) {
    return this.asymmetricEncrypt(payload, key);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  encryptWithSessionKey(payload: string, key: KeyLike): string {
    throw new AdapterError('Method not implemented'); // TODO
  }

  generateKeyPair() {
    return generateKeyPair(KEY_ALG, { extractable: true });
  }

  async generatePrivateKey() {
    return (await this.generateKeyPair()).privateKey;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateSessionKey(publicKey: KeyLike): KeyLike {
    throw new AdapterError('Method not implemented'); // TODO
  }

  async parseKey(key: string) {
    const parsed = await importJWK({ ...(JSON.parse(key) as JWK), ext: true }, KEY_ALG);
    if (parsed instanceof Uint8Array) throw new AdapterError('Unexpected key format');
    return parsed;
  }

  parsePrivateKey(key: string) {
    return this.parseKey(key);
  }

  parsePublicKey(key: string) {
    return this.parseKey(key);
  }

  async stringifyKey(key: KeyLike) {
    return JSON.stringify(await exportJWK(key));
  }

  stringifyPrivateKey(key: KeyLike) {
    return this.stringifyKey(key);
  }

  stringifyPublicKey(key: KeyLike) {
    return this.stringifyKey(key);
  }

  symmetricDecrypt(payload: string, passphrase: string) {
    return this.decrypt(payload, this.encoder.encode(passphrase));
  }

  symmetricEncrypt(payload: string, password: string) {
    return this.encrypt(payload, this.encoder.encode(password), {
      alg: 'PBES2-HS512+A256KW',
      enc: 'A256CBC-HS512',
    });
  }
}

export default Adapter;
