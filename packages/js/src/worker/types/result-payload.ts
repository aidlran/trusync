import type * as Result from '../interface/payload/index.js';
import type { ActionMixin } from '../interface/mixin/action.js';
import type { Payload } from './payload.js';

/** Discriminated union that defines the result payloads for each action. */
export type ResultPayload =
  | ActionMixin<'session.clear' | 'workerReady'>
  | Payload<'session.create', Result.CreateSessionResult>
  | Payload<'session.import', Result.ImportSessionResult>
  | Payload<'session.load', Result.LoadSessionResult>;
