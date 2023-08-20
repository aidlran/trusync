import type { ActionMixin } from '../interfaces/mixins/action.mixin.js';
import type { Action } from './action.js';
import type { ResultPayload } from './result-payload.js';

/** Used internally for communication from workers. */
export type Result<A extends Action> = ActionMixin<A> &
  ResultPayload & {
    // TODO: isolate these only to rejected promises
    error?: string;
    ok: boolean;
  };
