export interface KeyPair<PrivateKeyType, PublicKeyType> {
  privateKey?: PrivateKeyType;
  publicKey: PublicKeyType;
}
