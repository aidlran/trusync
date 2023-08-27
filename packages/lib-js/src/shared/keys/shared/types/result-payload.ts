import type * as Payloads from '../interfaces/payloads/index.js';
import type { ActionMixin } from '../interfaces/mixins/action.mixin.js';
import type { Payload } from './payload.js';

/**  Discriminated union that defines the request payloads for each action. */
export type ResultPayload =
  | Payload<
      'asymmetricDecrypt' | 'hybridDecrypt' | 'symmetricDecrypt' | 'symmetricEncrypt',
      Payloads.CryptResult
    >
  | Payload<'asymmetricEncrypt' | 'hybridShareKey', Payloads.AsymmetricCryptPayload>
  | ActionMixin<'destroySession'>
  | Payload<'encryptPrivateKey', Payloads.EncryptPrivateKeyResult>
  | Payload<'exportSession', Payloads.ExportSessionResult>
  | Payload<'generateKeyPair', Payloads.GenerateKeyPairResult>
  | Payload<'hybridEncrypt', Payloads.HybridEncryptResult>
  | Payload<'importKeyPair', Payloads.ImportKeysResult>
  | Payload<'importSession', Payloads.ImportSessionResult<boolean>>;
