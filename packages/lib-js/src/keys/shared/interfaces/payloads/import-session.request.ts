import type { SessionPayload } from './session-payload';

/** @deprecated */
export interface ImportSessionRequest<T extends boolean> extends SessionPayload {
  /**
   * Whether to immediately re-export the session with a new key.
   * This will also invalidate the old one.
   * Defaults to `false`.
   */
  reexport?: T;
}
