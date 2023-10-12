import type * as Payloads from '../interfaces/payloads';
import type { ActionMixin } from '../interfaces/mixins/action.mixin';
import type { Payload } from './payload';

/**  Discriminated union that defines the request payloads for each action. */
export type ResultPayload =
  // | Payload<
  //     'asymmetricDecrypt' | 'hybridDecrypt' | 'symmetricDecrypt' | 'symmetricEncrypt',
  //     Payloads.CryptResult
  //   >
  // | Payload<'asymmetricEncrypt' | 'hybridShareKey', Payloads.AsymmetricCryptPayload>
  | ActionMixin</*'destroySession' | */ 'importIdentity'>
  // | Payload<'encryptPrivateKey', Payloads.EncryptPrivateKeyResult>
  // | Payload<'exportSession', Payloads.ExportSessionResult>
  | Payload<'generateIdentity', Payloads.GenerateIdentityResult>;
// | Payload<'generateKeyPair', Payloads.GenerateKeyPairResult>
// | Payload<'hybridEncrypt', Payloads.HybridEncryptResult>
// | Payload<'importKeyPair', Payloads.ImportKeysResult>
// | Payload<'importSession', Payloads.ImportSessionResult<boolean>>;
