import * as nacl from 'tweetnacl';
import { concatenateByteArray, derivedShaB58 } from '../crypto/index.js';
import { TrusyncError } from '../error/trusync-error.js';
import { WorkerJobError } from '../error/worker-job-error.js';
import { create, get, put } from '../indexeddb/indexeddb.js';
import type {
  GenerateIdentityResult,
  InitSessionResult,
  UseSessionResult,
} from './interfaces/payloads/index.js';
import type { Action, Job } from './types/index.js';

// TODO: move and optimise these interfaces

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

// TODO: indexeddb is transforming the Uint8Array to Record
// make an indexeddb session repository that handles the conversion
interface SerialisedSession<T extends Iterable<number> | Record<number, number>> {
  identities: Array<{
    address: string;
    secret: T;
    types: {
      address: number;
      encrypt: number;
      sign: number;
    };
  }>;
}

interface LiveSession {
  id: IDBValidKey;
  secretKey: CryptoKey;
  metadata?: unknown;
}

interface SymmetricEncryptData {
  salt: Uint8Array;
  nonce: Uint8Array;
  payload: Uint8Array;
}

const encoder = new TextEncoder();
const importedIdentities = new Array<Identity>();

let session: LiveSession | undefined;

self.onmessage = async (event: MessageEvent<Job<Action>>) => {
  const { action, jobID } = event.data;

  if (!action) {
    throw errorResponse('No action was provided.', action, jobID);
  }

  try {
    const result = await (() => {
      switch (event.data.action) {
        case 'clearSession':
          return clearSession();
        case 'forgetIdentity':
          return forgetIdentity(event.data);
        case 'generateIdentity':
          return generateIdentity();
        case 'importIdentity':
          return importIdentity(event.data);
        case 'initSession':
          return initSession(event.data);
        case 'saveSession':
          return saveSession(event.data);
        case 'useSession':
          return useSession(event.data);
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
  } catch (error) {
    self.postMessage({
      action,
      error: 'Unknown error',
      jobID,
      ok: false,
    });
    throw error;
  }
};

self.postMessage({ action: 'workerReady' });

function errorResponse(error: string, action?: Action, jobID?: number): TrusyncError {
  self.postMessage({
    action,
    error,
    jobID,
    ok: false,
  });

  if (action) {
    return new WorkerJobError(action, error);
  } else {
    return new TrusyncError(error);
  }
}

// Utility functions

async function encryptSession(secretKey: CryptoKey): Promise<SymmetricEncryptData> {
  const jsonPayload: SerialisedSession<Iterable<number>> = {
    identities: importedIdentities.map((identity) => ({
      address: identity.address.value,
      secret: identity.secret,
      types: {
        address: identity.address.type,
        encrypt: identity.encrypt.type,
        sign: identity.sign.type,
      },
    })),
  };
  // TODO: move crypto functions to `src/crypto`
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encryptionKey = new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        iterations: 100000,
        salt,
      },
      secretKey,
      256,
    ),
  );
  const nonce = crypto.getRandomValues(new Uint8Array(nacl.secretbox.nonceLength));
  const messageBytes = encoder.encode(JSON.stringify(jsonPayload));
  // TODO: replace with WebCrypto implementation
  const payload = nacl.secretbox(messageBytes, nonce, encryptionKey);
  return {
    salt,
    nonce,
    payload,
  };
}

// Job handler functions
// TODO: move to individual files

function clearSession(): void {
  importedIdentities.length = 0;
  session = undefined;
}

function forgetIdentity(job: Job<'forgetIdentity'>): void {
  const foundIndex = importedIdentities.findIndex(
    (value) => value.address.value === job.payload.address,
  );
  if (foundIndex > -1) {
    importedIdentities.splice(foundIndex, 1);
  }
}

async function generateIdentity(): Promise<GenerateIdentityResult> {
  // TODO: move crypto functions to `src/crypto`
  // TODO: replace with WebCrypto implementation
  const encryptionKeyPair = nacl.box.keyPair();
  const signingKeyPair = nacl.sign.keyPair.fromSeed(encryptionKeyPair.secretKey);
  const address = await derivedShaB58(
    concatenateByteArray(encryptionKeyPair.publicKey, signingKeyPair.publicKey),
  );

  return {
    address,
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
  if (importedIdentities.find((identity) => identity.address.value === job.payload.address)) {
    throw errorResponse(`Address '${job.payload.address}' is already imported.`);
  }

  // TODO: move crypto functions to `src/crypto`
  // TODO: replace with WebCrypto implementation
  const encryptionKeyPair = nacl.box.keyPair.fromSecretKey(job.payload.secret);
  const signingKeyPair = nacl.sign.keyPair.fromSeed(job.payload.secret);
  const address = await derivedShaB58(
    concatenateByteArray(encryptionKeyPair.publicKey, signingKeyPair.publicKey),
  );

  if (address.value !== job.payload.address) {
    throw errorResponse('Invalid secret', job.action, job.jobID);
  }

  importedIdentities.push({
    address,
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

async function initSession(job: Job<'initSession'>): Promise<InitSessionResult> {
  // TODO: move crypto functions to `src/crypto`
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(job.payload.pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const { salt, nonce, payload } = await encryptSession(secretKey);
  const id = await create('session', {
    salt,
    nonce,
    payload,
    metadata: job.payload.metadata,
  });
  session = {
    id,
    secretKey,
    metadata: job.payload.metadata,
  };
  return {
    sessionID: id as number,
  };
}

async function saveSession(job: Job<'saveSession'>): Promise<void> {
  if (!session) {
    throw errorResponse(
      'No session active. `initSession` or `useSession` must be called first.',
      job.action,
      job.jobID,
    );
  }
  const { salt, nonce, payload } = await encryptSession(session.secretKey);
  await put('session', {
    id: session.id,
    salt,
    nonce,
    payload,
    metadata: session.metadata,
  });
}

async function useSession(job: Job<'useSession'>): Promise<UseSessionResult> {
  const { id, salt, nonce, payload, metadata } = await get('session', job.payload.sessionID).catch(
    () => {
      throw errorResponse('Could not get session.', job.action, job.jobID);
    },
  );

  // TODO: move crypto functions to `src/crypto`

  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(job.payload.pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const encryptionKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 100000,
      salt,
    },
    secretKey,
    256,
  );

  const message = nacl.secretbox.open(
    new Uint8Array(payload),
    new Uint8Array(nonce),
    new Uint8Array(encryptionKey),
  );

  if (!message) {
    throw errorResponse('Invalid pin.', job.action, job.jobID);
  }

  const serialised = JSON.parse(new TextDecoder().decode(message)) as SerialisedSession<
    Record<number, number>
  >;
  const identities = new Array<string>();

  importedIdentities.length = 0;
  importedIdentities.push(
    ...(await Promise.all(
      serialised.identities.map(async (identity) => {
        const secret = new Uint8Array(Object.values(identity.secret));
        const encryptionKeyPair = nacl.box.keyPair.fromSecretKey(secret);
        const signingKeyPair = nacl.sign.keyPair.fromSeed(secret);
        const address = await derivedShaB58(
          concatenateByteArray(encryptionKeyPair.publicKey, signingKeyPair.publicKey),
        );

        if (address.value !== identity.address) {
          throw errorResponse('Invalid secret', job.action, job.jobID);
        }

        identities.push(address.value);

        return {
          address,
          secret,
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
        };
      }),
    )),
  );

  session = {
    id,
    secretKey,
    metadata,
  };

  return {
    id: id as number,
    identities,
    metadata,
  };
}
