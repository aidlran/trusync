export interface CreateSessionRequest<T = unknown> {
  /** The passphrase used to protect session keys and to encrypt the session payload. */
  passphrase: string;

  /**
   * Optional arbitrary metadata to store unencrypted alongside the session. It can be used to help
   * differentiate sessions.
   */
  metadata?: T;
}
