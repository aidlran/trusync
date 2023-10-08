import type * as Payloads from '../interfaces/payloads/index.js';
import type { ActionMixin } from '../interfaces/mixins/action.mixin.js';
import type { Payload } from './payload.js';

/**  Discriminated union that defines the request payloads for each action. */
export type RequestPayload =
  | Payload<
      'asymmetricDecrypt' | 'asymmetricEncrypt' | 'hybridEncrypt',
      Payloads.AsymmetricCryptPayload
    >
  | ActionMixin<'destroySession' | 'exportSession' | 'generateIdentity'>
  | Payload<'encryptPrivateKey', Payloads.EncryptPrivateKeyRequest>
  | Payload<'generateKeyPair', Payloads.GenerateKeyPairRequest | undefined>
  | Payload<'hybridDecrypt', Payloads.HybridDecryptRequest>
  | Payload<'importKeyPair', Payloads.ImportKeyRequest>
  | Payload<'importSession', Payloads.ImportSessionRequest<boolean>>
  | Payload<'hybridShareKey', Payloads.HybridShareKeyRequest>
  | Payload<'symmetricDecrypt' | 'symmetricEncrypt', Payloads.SymmetricCryptPayload>;
