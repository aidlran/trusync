import type { Action } from '../../types/action';

export interface ActionMixin<T extends Action> {
  action: T;
}
