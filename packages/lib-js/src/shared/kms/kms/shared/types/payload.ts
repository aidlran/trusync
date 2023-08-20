import type { ActionMixin } from '../interfaces/mixins/action.mixin.js';
import type { PayloadDataMixin } from '../interfaces/mixins/payload-data.mixin.js';
import type { Action } from './action.js';

export type Payload<A extends Action, T = void> = ActionMixin<A> & PayloadDataMixin<T>;
