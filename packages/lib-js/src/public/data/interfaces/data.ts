export interface Data {
  id: string;
  keys: {
    encryptedDataKey: string;
    keyPairID: string;
  }[];
  ownerKeyPair: string;
  payload: string;
}
