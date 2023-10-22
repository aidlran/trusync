import type * as Payloads from '../interfaces/payloads';
import type { ActionMixin } from '../interfaces/mixins/action.mixin';
import type { Payload } from './payload';

/**
 * Discriminated union that defines the request payloads for each action.
 */
export type RequestPayload =
  // Have no payload
  | ActionMixin<'generateIdentity'>
  | ActionMixin<'getSessions'>
  | ActionMixin<'saveSession'>
  // Have a payload
  | Payload<'forgetIdentity', Payloads.ForgetIdentityRequest>
  | Payload<'importIdentity', Payloads.ImportIdentityRequest>
  | Payload<'initSession', Payloads.InitSessionRequest>
  | Payload<'useSession', Payloads.UseSessionRequest>;
