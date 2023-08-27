export interface HybridShareKeyRequest {
  /** The session key to re-encrypt. */
  sessionKey: string;

  /** ID of the asymmetric key pair to decrypt the session key. */
  decryptKeyID: string;

  /** ID of the asymmetric key pair to re-encrypt the session key with. */
  encryptKeyID: string;
}
