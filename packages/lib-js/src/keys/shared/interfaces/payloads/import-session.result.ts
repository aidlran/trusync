import type { SessionPayload } from './session-payload';

/** @deprecated */
export type ImportSessionResult<T extends boolean> = ImportSessionBaseResult<T> &
  (ImportSessionReexportedResult | ImportSessionNotReexportedResult);

/** @deprecated */
interface ImportSessionBaseResult<T extends boolean> {
  /** An array of the IDs of the imported keys. */
  importedKeyIDs: string[];

  /** Whether the session was re-exported and included in this result. */
  reexported: T;
}

/** @deprecated */
interface ImportSessionReexportedResult extends SessionPayload {
  reexported: true;
}

/** @deprecated */
interface ImportSessionNotReexportedResult {
  reexported: false;
}
