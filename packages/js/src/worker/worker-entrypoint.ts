import { Buffer } from 'buffer';
import { createSession } from './jobs/session/create.js';
import { save } from './jobs/session/save.js';
import { load } from './jobs/session/load.js';
import type { Action, Job } from './types/index.js';
import type { BIP32Interface } from 'bip32';
import { importSession } from './jobs/session/import.js';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- re-enable once using this
let session: BIP32Interface | undefined;

self.onmessage = async (event: MessageEvent<Job<Action> | undefined>) => {
  try {
    if (!event.data?.action) {
      throw TypeError('No action provided');
    }

    let resultPayload: unknown;

    switch (event.data.action) {
      case 'session.clear': {
        session = undefined;
        break;
      }
      case 'session.create': {
        resultPayload = await createSession(save, event.data.payload);
        break;
      }
      case 'session.import': {
        resultPayload = await importSession(save, event.data.payload);
        break;
      }
      case 'session.load': {
        const { node, result } = await load(event.data.payload);
        session = node;
        resultPayload = result;
        break;
      }
      default: {
        throw TypeError('Action not supported');
      }
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
