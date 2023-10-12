import type { ActionMixin } from '../interfaces/mixins/action.mixin';
import type { Action } from './action';
import type { ResultPayload } from './result-payload';

/** Used internally for communication from workers. */
export type Result<A extends Action> = ActionMixin<A> &
  ResultPayload & {
    // TODO: isolate these only to rejected promises
    error?: string;
    ok: boolean;
  };
