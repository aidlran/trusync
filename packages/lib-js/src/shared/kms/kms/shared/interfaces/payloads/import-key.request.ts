/** A key pair, entire or partial, to import. */
export interface ImportKeyRequest {
  /** A private key string to import. */
  privateKey?: string;

  /** A public key string to import */
  publicKey: string;

  /**
   * The ID of the key (pair).
   * @todo Make it optional.
   */
  keyID: string;

  /** The secret to decrypt the private key. */
  secret?: string;
}
