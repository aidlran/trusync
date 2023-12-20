import type * as Result from '../interface/payload/index.js';
import type { ActionMixin } from '../interface/mixin/action.js';
import type { Payload } from './payload.js';

/** Discriminated union that defines the result payloads for each action. */
export type ResultPayload =
  // Have no payload
  | ActionMixin<
      'clearSession' | 'forgetIdentity' | 'importIdentity' | 'saveSession' | 'workerReady'
    >
  // Have a payload
  | Payload<'generateIdentity', Result.GenerateIdentityResult>
  | Payload<'initSession', Result.InitSessionResult>
  | Payload<'useSession', Result.UseSessionResult>;
