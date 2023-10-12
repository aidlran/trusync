import type { SessionKey } from './session-key-pair';

export interface Session {
  keys: SessionKey[];
}
