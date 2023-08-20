import type { SessionKey } from './session-key-pair.js';

export interface Session {
  keys: SessionKey[];
}
