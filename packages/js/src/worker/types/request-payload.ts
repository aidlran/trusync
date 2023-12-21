import type * as Request from '../interface/payload/index.js';
import type { ActionMixin } from '../interface/mixin/action.js';
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
  | Payload<'session.create', Request.CreateSessionRequest>
  | Payload<'useSession', Request.UseSessionRequest>;
