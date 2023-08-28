import type { SessionPayload } from './session-payload.js';

export type ImportSessionResult<T extends boolean> = ImportSessionBaseResult<T> &
  (ImportSessionReexportedResult | ImportSessionNotReexportedResult);

interface ImportSessionBaseResult<T extends boolean> {
  /** An array of the IDs of the imported keys. */
  importedKeyIDs: string[];

  /** Whether the session was re-exported and included in this result. */
  reexported: T;
}

interface ImportSessionReexportedResult extends SessionPayload {
  reexported: true;
}

interface ImportSessionNotReexportedResult {
  reexported: false;
}
