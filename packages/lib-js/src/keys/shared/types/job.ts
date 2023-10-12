import type { JobMetadataMixin } from '../interfaces/mixins/job-metadata.mixin';
import type { Action } from './action';
import type { Request } from './request';

/** Used internally for communication to workers. */
export type Job<A extends Action> = Request<A> & JobMetadataMixin;
