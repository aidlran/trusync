import type { ActionMixin } from '../interfaces/mixins/action.mixin';
import type { JobMetadataMixin } from '../interfaces/mixins/job-metadata.mixin';
import type { Action } from './action';

export type FailedJob<A extends Action> = ActionMixin<A> &
  JobMetadataMixin & {
    error: string;
    ok: false;
  };
