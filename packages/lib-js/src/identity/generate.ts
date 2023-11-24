import * as nacl from 'tweetnacl';
import { generateAddress } from '../crypto/address.js';
import { Identity } from './identity.js';

export async function generate(): Promise<{
  secret: Uint8Array;
  identity: Identity;
}> {
  // TODO: move crypto functions to `src/crypto`
  // TODO: replace with WebCrypto implementation
  const encryptionKeyPair = nacl.box.keyPair();
  const signingKeyPair = nacl.sign.keyPair.fromSeed(encryptionKeyPair.secretKey);
  const address = await generateAddress(encryptionKeyPair.publicKey, signingKeyPair.publicKey);

  return {
    secret: encryptionKeyPair.secretKey,
    identity: new Identity(
      address.value,
      address.type,
      encryptionKeyPair.publicKey,
      0,
      signingKeyPair.publicKey,
      0,
    ),
  };
}
