import type { MaybePromise } from '../../shared/types/maybe';

// TODO: allow library to define options objects

export interface IAdapter<PrivateKeyType, PublicKeyType, SessionKeyType> {
  generateKeyPair(): MaybePromise<{
    privateKey: PrivateKeyType;
    publicKey: PublicKeyType;
  }>;
  generatePrivateKey(): MaybePromise<PrivateKeyType>;
  generateSessionKey(publicKey: PublicKeyType): MaybePromise<SessionKeyType>;

  parsePrivateKey(key: string): MaybePromise<PrivateKeyType>;
  parsePublicKey(key: string): MaybePromise<PublicKeyType>;

  stringifyPrivateKey(key: PrivateKeyType): MaybePromise<string>;
  stringifyPublicKey(key: PublicKeyType): MaybePromise<string>;

  decryptPrivateKey(privateKey: string, secret: string): MaybePromise<PrivateKeyType>;
  encryptPrivateKey(privateKey: PrivateKeyType, secret: string): MaybePromise<string>;
  decryptSessionKey(sessionKey: string, privateKey: PrivateKeyType): MaybePromise<SessionKeyType>;
  encryptSessionKey(sessionKey: SessionKeyType, publicKey: PublicKeyType): MaybePromise<string>;

  decryptWithPrivateKey(payload: string, key: PrivateKeyType): MaybePromise<string>;
  decryptWithSessionKey(payload: string, key: SessionKeyType): MaybePromise<string>;

  /** @deprecated */
  encryptWithPrivateKey(payload: string, key: PrivateKeyType): MaybePromise<string>;
  encryptWithPublicKey(payload: string, key: PublicKeyType): MaybePromise<string>;
  encryptWithSessionKey(payload: string, key: SessionKeyType): MaybePromise<string>;

  symmetricDecrypt(payload: string, passphrase: string): MaybePromise<string>;
  symmetricEncrypt(payload: string, passphrase: string): MaybePromise<string>;
}
