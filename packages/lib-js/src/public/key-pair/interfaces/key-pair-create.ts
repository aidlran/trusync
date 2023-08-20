// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IKeyPairCreate = {
  /** An armored, encrypted PGP private key. */
  privateKey: string;
  /** An armored PGP public key derived from the private key. */
  publicKey: string;
};
