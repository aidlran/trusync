import type { Action } from '../../types/action.js';

export interface ActionMixin<T extends Action> {
  action: T;
}
