import type * as Request from '../interface/payload/index.js';
import type { ActionMixin } from '../interface/mixin/action.js';
import type { Payload } from './payload.js';

/** Discriminated union that defines the request payloads for each action. */
export type RequestPayload =
  | ActionMixin<'session.clear'>
  | Payload<'session.create', Request.CreateSessionRequest>
  | Payload<'session.import', Request.ImportSessionRequest>
  | Payload<'session.load', Request.LoadSessionRequest>;
