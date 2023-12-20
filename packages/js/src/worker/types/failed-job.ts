import type { ActionMixin } from '../interface/mixin/action.js';
import type { JobMetadataMixin } from '../interface/mixin/job-metadata.js';
import type { Action } from './action.js';

export type FailedJob<A extends Action> = ActionMixin<A> &
  JobMetadataMixin & {
    error: string;
    ok: false;
  };
