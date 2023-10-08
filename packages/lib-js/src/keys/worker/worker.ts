import * as nacl from 'tweetnacl';
import { KeyManagerActionError, KeyManagerError } from '../shared';
import type { GenerateIdentityResult } from '../shared/interfaces/payloads/generate-identity-result';
import { Action } from '../shared/types';
import Adapter from './adapters/openpgp';
import { Worker } from './classes/worker';

interface Job {
  action: Action;
  jobID: number;
}

const newWorker = false;

if (!newWorker) {
  new Worker(new Adapter());
} else {
  self.onmessage = (event: MessageEvent<Job>) => {
    const { action, jobID } = event.data;

    if (!action) {
      throw errorResponse('No action was provided.', action, jobID);
    }

    const result = (() => {
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
}

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

function generateIdentity(): GenerateIdentityResult {
  const { publicKey: publicEncryptionKey, secretKey: secretEncryptionKey } = nacl.box.keyPair();

  const { publicKey: publicSigningKey } = nacl.sign.keyPair.fromSeed(secretEncryptionKey);

  return {
    address: {
      value: '',
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
