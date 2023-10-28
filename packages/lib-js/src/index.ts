import { TrusyncApp } from './app/trusync-app.js';
import type { Channel } from './data/channel/channel.js';
import { Data } from './data/data.js';
import { Identity } from './identity/identity.js';
import { KeyManager } from './keys/primary/classes/key-manager.js';
import { workerConstructor } from './worker/worker-constructor.js';

export type { Channel, Data, Identity, TrusyncApp };

export * from './crypto/index.js';
export type { GenerateIdentityResult } from './keys/shared/index.js';
export * from './session/session.js';
export * from './storage/interfaces/index.js';

export function trusyncApp() {
  const channels = new Array<Channel>();
  const data = new Data(channels);
  /** @deprecated Use `WORKER_DISPATCH`. */
  const keyManager = new KeyManager(workerConstructor());
  const identity = new Identity(data, keyManager);
  const app = new TrusyncApp(channels, data, identity);
  return app;
}
