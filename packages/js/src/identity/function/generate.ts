import * as nacl from 'tweetnacl';
import { concatenateByteArray, derivedShaB58 } from '../../crypto/index.js';
import type { Node } from '../../node/node.js';
import type { Identity } from '../interface/identity.js';

export interface GeneratedIdentity {
  secret: Uint8Array;
  identity: Node<Identity>;
}

export function generate(createIdentityNode: () => Node<Identity>): Promise<GeneratedIdentity> {
  // TODO: move crypto functions to `src/crypto`
  // TODO: replace with WebCrypto implementation
  const encryptionKeyPair = nacl.box.keyPair();
  const signingKeyPair = nacl.sign.keyPair.fromSeed(encryptionKeyPair.secretKey);
  return derivedShaB58(
    concatenateByteArray(encryptionKeyPair.publicKey, signingKeyPair.publicKey),
  ).then((address) => {
    const identity = createIdentityNode();
    identity.value = {
      address,
      encrypt: {
        publicKey: encryptionKeyPair.publicKey,
        type: 0,
      },
      sign: {
        publicKey: signingKeyPair.publicKey,
        type: 0,
      },
    };
    return {
      secret: encryptionKeyPair.secretKey,
      identity,
    };
  });
}
