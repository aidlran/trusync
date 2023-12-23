export interface UnlockSessionResult<T = unknown> {
  id: number;

  /** The optional arbitrary metadata stored associated with the session. */
  metadata?: T;
}
