import * as nacl from 'tweetnacl';
import { concatenateByteArray, derivedShaB58 } from '../../crypto/index.js';
import type { Data } from '../../data/data.js';
import { Identity } from '../class/identity.js';

export interface GeneratedIdentity {
  secret: Uint8Array;
  identity: Identity;
}

export function generate(data: Data): Promise<GeneratedIdentity> {
  // TODO: move crypto functions to `src/crypto`
  // TODO: replace with WebCrypto implementation
  const encryptionKeyPair = nacl.box.keyPair();
  const signingKeyPair = nacl.sign.keyPair.fromSeed(encryptionKeyPair.secretKey);

  return derivedShaB58(
    concatenateByteArray(encryptionKeyPair.publicKey, signingKeyPair.publicKey),
  ).then((address) => ({
    secret: encryptionKeyPair.secretKey,
    identity: new Identity(
      data,
      address,
      encryptionKeyPair.publicKey,
      0,
      signingKeyPair.publicKey,
      0,
    ),
  }));
}
