import type { JobMetadataMixin } from '../interface/mixin/job-metadata.js';
import type { Action } from './action.js';
import type { Result } from './result.js';

/** Used internally for communication from workers. */
export type CompletedJob<A extends Action> = Result<A> & JobMetadataMixin;
