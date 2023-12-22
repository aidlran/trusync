import * as nacl from 'tweetnacl';
import { concatenateByteArray, derivedShaB58 } from '../crypto/index.js';
import { create, get, put } from '../indexeddb/indexeddb.js';
import type {
  GenerateIdentityResult,
  InitSessionResult,
  UseSessionResult,
} from './interface/payload/index.js';
import { create as createSession } from './jobs/session/create.js';
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

self.onmessage = async (event: MessageEvent<Job<Action> | undefined>) => {
  try {
    if (!event.data?.action) {
      throw TypeError('No action provided');
    }

    let resultPayload: unknown;

    switch (event.data.action) {
      case 'clearSession':
        resultPayload = clearSession();
        break;
      case 'forgetIdentity':
        // TODO: rename job action to "identity.forget"
        //       potentially deprecated
        resultPayload = forgetIdentity(event.data.payload);
        break;
      case 'generateIdentity':
        // TODO: rename job action to "identity.generate"
        //       potentially deprecated
        resultPayload = await generateIdentity();
        break;
      case 'importIdentity':
        // TODO: rename job action to "identity.import"
        //       potentially deprecated
        resultPayload = await importIdentity(event.data.payload);
        break;
      case 'initSession':
        // TODO: may be deprecated by "session.create"
        resultPayload = await initSession(event.data.payload);
        break;
      case 'saveSession':
        // TODO: may be deprecated, we'll just autosave
        resultPayload = await saveSession();
        break;
      case 'session.create':
        resultPayload = await createSession(event.data.payload);
        break;
      case 'useSession':
        // TODO: rename job action to "session.use"
        resultPayload = await useSession(event.data.payload);
        break;
      default:
        throw TypeError('Action not supported');
    }
    self.postMessage({
      action: event.data?.action,
      jobID: event.data?.jobID,
      ok: true,
      payload: resultPayload,
    });
  } catch (error) {
    self.postMessage({
      action: event.data?.action,
      jobID: event.data?.jobID,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

self.postMessage({ action: 'workerReady' });

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

function forgetIdentity(job: Job<'forgetIdentity'>['payload']): void {
  const foundIndex = importedIdentities.findIndex((value) => value.address.value === job.address);
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

async function importIdentity(job: Job<'importIdentity'>['payload']): Promise<void> {
  if (importedIdentities.find((identity) => identity.address.value === job.address)) {
    throw Error(`Address '${job.address}' is already imported.`);
  }

  // TODO: move crypto functions to `src/crypto`
  // TODO: replace with WebCrypto implementation
  const encryptionKeyPair = nacl.box.keyPair.fromSecretKey(job.secret);
  const signingKeyPair = nacl.sign.keyPair.fromSeed(job.secret);
  const address = await derivedShaB58(
    concatenateByteArray(encryptionKeyPair.publicKey, signingKeyPair.publicKey),
  );

  if (address.value !== job.address) {
    throw Error('Invalid secret');
  }

  importedIdentities.push({
    address,
    secret: job.secret,
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

// TODO: may be deprecated by `createSession()`
async function initSession(job: Job<'initSession'>['payload']): Promise<InitSessionResult> {
  // TODO: move crypto functions to `src/crypto`
  const secretKey = await crypto.subtle.importKey('raw', encoder.encode(job.pin), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const { salt, nonce, payload } = await encryptSession(secretKey);
  const id = await create('session', {
    salt,
    nonce,
    payload,
    metadata: job.metadata,
  });
  session = {
    id,
    secretKey,
    metadata: job.metadata,
  };
  return {
    sessionID: id as number,
  };
}

async function saveSession(): Promise<void> {
  if (!session) {
    throw Error('No active session');
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

async function useSession(job: Job<'useSession'>['payload']): Promise<UseSessionResult> {
  const { id, salt, nonce, payload, metadata } = await get('session', job.sessionID);

  // TODO: move crypto functions to `src/crypto`

  const secretKey = await crypto.subtle.importKey('raw', encoder.encode(job.pin), 'PBKDF2', false, [
    'deriveBits',
  ]);

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
    throw Error('Invalid passphrase');
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
          throw Error('Invalid secret');
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
