export interface LoadSessionRequest {
  /** The ID of the target session. */
  id: number;

  /** The passphrase needed to decrypt the session. */
  passphrase: string;
}
