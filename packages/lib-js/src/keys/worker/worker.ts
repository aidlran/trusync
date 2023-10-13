import * as nacl from 'tweetnacl';
import { concatenateByteArray } from '../../crypto/common/buffer-utils';
import { sha256 } from '../../crypto/hash/sha256';
import { base58 } from '../../crypto/encode/base';
import { type GenerateIdentityResult, KeyManagerActionError, KeyManagerError } from '../shared';
import type { Action, Job } from '../shared/types';

interface Address {
  value: string;
  type: number;
}

interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  type: number;
}

interface Identity {
  address: Address;
  secret: Uint8Array;
  encrypt: KeyPair;
  sign: KeyPair;
}

const importedIdentities = new Array<Identity>();

self.onmessage = async (event: MessageEvent<Job<Action>>) => {
  const { action, jobID } = event.data;

  if (!action) {
    throw errorResponse('No action was provided.', action, jobID);
  }

  const result = await (() => {
    switch (event.data.action) {
      case 'forgetIdentity':
        return forgetIdentity(event.data);
      case 'generateIdentity':
        return generateIdentity();
      case 'importIdentity':
        return importIdentity(event.data);
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

// Utility functions

// TODO: move to crypto module
async function generateAddress(
  publicEncryptionKey: Uint8Array,
  publicSigningKey: Uint8Array,
): Promise<string> {
  const addressByteArray = concatenateByteArray(publicEncryptionKey, publicSigningKey);
  const addressHash = await sha256(addressByteArray);
  const addressEncoded = base58.encode(addressHash);

  return addressEncoded;
}

// Job handler functions

function forgetIdentity(job: Job<'forgetIdentity'>): void {
  const foundIndex = importedIdentities.findIndex(
    (value) => value.address.value === job.payload.address,
  );
  if (foundIndex > -1) {
    importedIdentities.splice(foundIndex, 1);
  }
}

async function generateIdentity(): Promise<GenerateIdentityResult> {
  const encryptionKeyPair = nacl.box.keyPair();
  const signingKeyPair = nacl.sign.keyPair.fromSeed(encryptionKeyPair.secretKey);
  const address = await generateAddress(encryptionKeyPair.publicKey, signingKeyPair.publicKey);

  return {
    address: {
      value: address,
      type: 0,
    },
    encryption: {
      publicKey: encryptionKeyPair.publicKey,
      type: 0,
    },
    secret: encryptionKeyPair.secretKey,
    signing: {
      publicKey: signingKeyPair.publicKey,
      type: 0,
    },
  };
}

async function importIdentity(job: Job<'importIdentity'>): Promise<void> {
  const encryptionKeyPair = nacl.box.keyPair.fromSecretKey(job.payload.secret);
  const signingKeyPair = nacl.sign.keyPair.fromSeed(job.payload.secret);
  const address = await generateAddress(encryptionKeyPair.publicKey, signingKeyPair.publicKey);

  if (address !== job.payload.address) {
    throw errorResponse('Invalid secret');
  }

  importedIdentities.push({
    address: {
      value: address,
      type: 0,
    },
    secret: job.payload.secret,
    encrypt: {
      publicKey: encryptionKeyPair.publicKey,
      secretKey: encryptionKeyPair.secretKey,
      type: 0,
    },
    sign: {
      publicKey: signingKeyPair.publicKey,
      secretKey: signingKeyPair.secretKey,
      type: 0,
    },
  });
}
