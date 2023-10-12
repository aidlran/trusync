import type { ActionMixin } from '../interfaces/mixins/action.mixin';
import type { PayloadDataMixin } from '../interfaces/mixins/payload-data.mixin';
import type { Action } from './action';

export type Payload<A extends Action, T = void> = ActionMixin<A> & PayloadDataMixin<T>;
