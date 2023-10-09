import * as nacl from 'tweetnacl';
import { concatenateByteArray } from '../../crypto/common/buffer-utils';
import { sha256 } from '../../crypto/hash/sha256';
import { base58 } from '../../crypto/encode/base';
import { type GenerateIdentityResult, KeyManagerActionError, KeyManagerError } from '../shared';
import type { Action } from '../shared/types';

interface Job {
  action: Action;
  jobID: number;
}

self.onmessage = async (event: MessageEvent<Job>) => {
  const { action, jobID } = event.data;

  if (!action) {
    throw errorResponse('No action was provided.', action, jobID);
  }

  const result = await (() => {
    switch (action) {
      case 'generateIdentity':
        return generateIdentity();
      default:
        throw errorResponse('This action is not supported.', action, jobID);
    }
  })();

  self.postMessage({
    action,
    jobID,
    ok: true,
    payload: result,
  });
};

function errorResponse(error: string, action?: Action, jobID?: number): KeyManagerError {
  self.postMessage({
    action,
    error,
    jobID,
    ok: false,
  });

  if (action) {
    return new KeyManagerActionError(action, error);
  } else {
    return new KeyManagerError(error);
  }
}

async function generateIdentity(): Promise<GenerateIdentityResult> {
  const { publicKey: publicEncryptionKey, secretKey: secretEncryptionKey } = nacl.box.keyPair();

  const { publicKey: publicSigningKey } = nacl.sign.keyPair.fromSeed(secretEncryptionKey);

  const addressByteArray = concatenateByteArray(publicEncryptionKey, publicSigningKey);
  const addressHash = await sha256(addressByteArray);
  const addressEncoded = base58.encode(addressHash);

  return {
    address: {
      value: addressEncoded,
      type: 0,
    },
    encryption: {
      publicKey: publicEncryptionKey,
      type: 0,
    },
    secret: secretEncryptionKey,
    signing: {
      publicKey: publicSigningKey,
      type: 0,
    },
  };
}
