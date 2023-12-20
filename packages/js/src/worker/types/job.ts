import type { JobMetadataMixin } from '../interface/mixin/job-metadata.js';
import type { Action } from './action.js';
import type { Request } from './request.js';

/** Used internally for communication to workers. */
export type Job<A extends Action> = Request<A> & JobMetadataMixin;
