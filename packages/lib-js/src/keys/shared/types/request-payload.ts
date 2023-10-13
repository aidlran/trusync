import type * as Payloads from '../interfaces/payloads';
import type { ActionMixin } from '../interfaces/mixins/action.mixin';
import type { Payload } from './payload';

/**  Discriminated union that defines the request payloads for each action. */
export type RequestPayload =
  // | Payload<
  //     'asymmetricDecrypt' | 'asymmetricEncrypt' | 'hybridEncrypt',
  //     Payloads.AsymmetricCryptPayload
  //   >
  | ActionMixin</*'destroySession' | 'exportSession' | */ 'generateIdentity'>
  // | Payload<'encryptPrivateKey', Payloads.EncryptPrivateKeyRequest>
  | Payload<'forgetIdentity', Payloads.ForgetIdentityRequest>
  // | Payload<'generateKeyPair', Payloads.GenerateKeyPairRequest | undefined>
  // | Payload<'hybridDecrypt', Payloads.HybridDecryptRequest>
  | Payload<'importIdentity', Payloads.ImportIdentityRequest>;
// | Payload<'importKeyPair', Payloads.ImportKeyRequest>
// | Payload<'importSession', Payloads.ImportSessionRequest<boolean>>
// | Payload<'hybridShareKey', Payloads.HybridShareKeyRequest>
// | Payload<'symmetricDecrypt' | 'symmetricEncrypt', Payloads.SymmetricCryptPayload>;
