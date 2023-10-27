import type * as Result from '../interfaces/payloads/results/index.js';
import type { ActionMixin } from '../interfaces/mixins/action.mixin.js';
import type { Payload } from './payload.js';

/** Discriminated union that defines the result payloads for each action. */
export type ResultPayload =
  // Have no payload
  | ActionMixin<'forgetIdentity' | 'importIdentity' | 'reset' | 'saveSession' | 'workerReady'>
  // Have a payload
  | Payload<'generateIdentity', Result.GenerateIdentityResult>
  | Payload<'initSession', Result.InitSessionResult>
  | Payload<'useSession', Result.UseSessionResult>;
