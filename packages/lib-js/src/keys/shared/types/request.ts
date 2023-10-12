import type { ActionMixin } from '../interfaces/mixins/action.mixin';
import type { Action } from './action';
import type { RequestPayload } from './request-payload';

export type Request<A extends Action> = ActionMixin<A> & RequestPayload;
