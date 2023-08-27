import type { ActionMixin } from '../interfaces/mixins/action.mixin.js';
import type { Action } from './action.js';
import type { RequestPayload } from './request-payload.js';

export type Request<A extends Action> = ActionMixin<A> & RequestPayload;
