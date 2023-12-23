import { Buffer } from 'buffer';
import { create } from './jobs/session/create.js';
import { save } from './jobs/session/save.js';
import { unlock } from './jobs/session/unlock.js';
import type { Action, Job } from './types/index.js';
import { activate } from './jobs/session/activate.js';
import type { BIP32Interface } from 'bip32';

// Polyfill Buffer for bip32 package
globalThis.Buffer = Buffer;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- re-enable once using this
let session: BIP32Interface;

self.onmessage = async (event: MessageEvent<Job<Action> | undefined>) => {
  try {
    if (!event.data?.action) {
      throw TypeError('No action provided');
    }

    let resultPayload: unknown;

    switch (event.data.action) {
      case 'session.clear': {
        throw Error('Not implemented');
      }
      case 'session.create': {
        const { node, result } = await create(save, activate, event.data.payload);
        session = node;
        resultPayload = result;
        break;
      }
      case 'session.unlock': {
        await unlock(activate, event.data.payload);
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
