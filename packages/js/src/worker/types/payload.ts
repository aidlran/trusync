import type { ActionMixin } from '../interface/mixin/action.js';
import type { PayloadDataMixin } from '../interface/mixin/payload-data.js';
import type { Action } from './action.js';

export type Payload<A extends Action, T = void> = ActionMixin<A> & PayloadDataMixin<T>;
