export interface UnlockSessionRequest {
  /** The ID of the target session. */
  id: number;

  /** The passphrase needed to decrypt the session and access its keys. */
  passphrase: string;
}
