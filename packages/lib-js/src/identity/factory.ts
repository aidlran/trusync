import * as nacl from 'tweetnacl';
import { concatenateByteArray, derivedShaB58 } from '../crypto/index.js';
import { Data } from '../data/data.js';
import { Identity } from './identity.js';

export interface GeneratedIdentity {
  secret: Uint8Array;
  identity: Identity;
}

export function identityFactory(data: Data) {
  return function (callback?: (generated: GeneratedIdentity) => unknown) {
    // TODO: move crypto functions to `src/crypto`
    // TODO: replace with WebCrypto implementation
    const encryptionKeyPair = nacl.box.keyPair();
    const signingKeyPair = nacl.sign.keyPair.fromSeed(encryptionKeyPair.secretKey);
    return derivedShaB58(
      concatenateByteArray(encryptionKeyPair.publicKey, signingKeyPair.publicKey),
      (address) => {
        const generated: GeneratedIdentity = {
          secret: encryptionKeyPair.secretKey,
          identity: new Identity(
            data,
            address,
            encryptionKeyPair.publicKey,
            0,
            signingKeyPair.publicKey,
            0,
          ),
        };

        if (callback) {
          callback(generated);
        }

        return generated;
      },
    );
  };
}
