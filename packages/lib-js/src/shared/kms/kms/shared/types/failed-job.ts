import type { ActionMixin } from '../interfaces/mixins/action.mixin.js';
import type { JobMetadataMixin } from '../interfaces/mixins/job-metadata.mixin.js';
import type { Action } from './action.js';

export type FailedJob<A extends Action> = ActionMixin<A> &
  JobMetadataMixin & {
    error: string;
    ok: false;
  };
