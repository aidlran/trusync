import type { JobMetadataMixin } from '../interfaces/mixins/job-metadata.mixin';
import type { Action } from './action';
import type { Result } from './result';

/** Used internally for communication from workers. */
export type CompletedJob<A extends Action> = Result<A> & JobMetadataMixin;
