import type * as Payloads from '../interfaces/payloads';
import type { ActionMixin } from '../interfaces/mixins/action.mixin';
import type { Payload } from './payload';

/**
 * Discriminated union that defines the result payloads for each action.
 */
export type ResultPayload =
  // Have no payload
  | ActionMixin<'forgetIdentity' | 'importIdentity' | 'reset' | 'saveSession' | 'workerReady'>
  // Have a payload
  | Payload<'generateIdentity', Payloads.GenerateIdentityResult>
  | Payload<'getSessions', Payloads.GetSessionsResult>
  | Payload<'initSession', Payloads.InitSessionResult>
  | Payload<'useSession', Payloads.UseSessionResult>;
