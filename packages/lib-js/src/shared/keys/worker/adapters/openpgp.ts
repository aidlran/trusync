import {
  type PrivateKey,
  type PublicKey,
  type SessionKey,
  createMessage,
  decrypt,
  decryptKey,
  decryptSessionKeys,
  encrypt,
  encryptKey,
  encryptSessionKey,
  generateKey,
  generateSessionKey,
  readKey,
  readMessage,
  readPrivateKey,
} from 'openpgp';
import type { IAdapter } from '../interfaces/adapter.js';

export class Adapter implements IAdapter<PrivateKey, PublicKey, SessionKey> {
  async decryptPrivateKey(armoredKey: string, passphrase: string) {
    return await decryptKey({
      privateKey: await readPrivateKey({ armoredKey }),
      passphrase,
    });
  }

  async decryptSessionKey(armoredMessage: string, decryptionKeys: PrivateKey) {
    return (
      await decryptSessionKeys({
        message: await readMessage({ armoredMessage }),
        decryptionKeys,
      })
    )[0];
  }

  async decryptWithPrivateKey(armoredMessage: string, decryptionKeys: PrivateKey) {
    return (
      await decrypt({
        message: await readMessage({ armoredMessage }),
        decryptionKeys,
      })
    ).data;
  }

  async decryptWithSessionKey(armoredMessage: string, sessionKeys: SessionKey) {
    return (
      await decrypt({
        message: await readMessage({ armoredMessage }),
        sessionKeys,
      })
    ).data;
  }

  derivePublicKey(privateKey: PrivateKey): PublicKey {
    return privateKey.toPublic();
  }

  async encryptPrivateKey(privateKey: PrivateKey, passphrase: string) {
    return (await encryptKey({ privateKey, passphrase })).armor();
  }

  encryptSessionKey(sessionKey: SessionKey, encryptionKeys: PrivateKey) {
    return encryptSessionKey({
      format: 'armored',
      encryptionKeys,
      ...sessionKey,
    });
  }

  async encryptWithPrivateKey(text: string, encryptionKeys: PrivateKey) {
    const message = await createMessage({ text });
    return await encrypt({ message, encryptionKeys });
  }

  async encryptWithPublicKey(text: string, encryptionKeys: PublicKey) {
    const message = await createMessage({ text });
    return await encrypt({ message, encryptionKeys });
  }

  async encryptWithSessionKey(text: string, sessionKey: SessionKey) {
    const message = await createMessage({ text });
    return await encrypt({ message, sessionKey });
  }

  generateKeyPair() {
    return generateKey({ format: 'object', userIDs: {} });
  }

  async generatePrivateKey() {
    return (await generateKey({ format: 'object', userIDs: {} })).privateKey;
  }

  generateSessionKey(encryptionKeys: PublicKey) {
    return generateSessionKey({ encryptionKeys });
  }

  parsePrivateKey(armoredKey: string) {
    return readPrivateKey({ armoredKey });
  }

  parsePublicKey(armoredKey: string) {
    return readKey({ armoredKey });
  }

  stringifyPrivateKey(key: PrivateKey) {
    return key.armor();
  }

  stringifyPublicKey(key: PublicKey) {
    return key.armor();
  }

  async symmetricDecrypt(armoredMessage: string, passwords: string) {
    return (
      await decrypt({
        message: await readMessage({ armoredMessage }),
        passwords,
      })
    ).data;
  }

  async symmetricEncrypt(text: string, passwords: string) {
    return await encrypt({ message: await createMessage({ text }), passwords });
  }
}

export default Adapter;
