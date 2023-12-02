import type * as Request from '../interfaces/payloads/requests/index.js';
import type { ActionMixin } from '../interfaces/mixins/action.mixin.js';
import type { Payload } from './payload.js';

/** Discriminated union that defines the request payloads for each action. */
export type RequestPayload =
  // Have no payload
  | ActionMixin<'clearSession'>
  | ActionMixin<'generateIdentity'>
  | ActionMixin<'saveSession'>
  // Have a payload
  | Payload<'forgetIdentity', Request.ForgetIdentityRequest>
  | Payload<'importIdentity', Request.ImportIdentityRequest>
  | Payload<'initSession', Request.InitSessionRequest>
  | Payload<'useSession', Request.UseSessionRequest>;
