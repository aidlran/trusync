export type Action =
  | 'asymmetricDecrypt'
  | 'asymmetricEncrypt'
  | 'destroySession'
  | 'encryptPrivateKey'
  | 'exportSession'
  | 'generateKeyPair'
  | 'hybridDecrypt'
  | 'hybridEncrypt'
  | 'importKeyPair'
  | 'importSession'
  | 'hybridShareKey'
  | 'symmetricDecrypt'
  | 'symmetricEncrypt';
