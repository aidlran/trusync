import { workerConstructor } from './worker-constructor.js';
import { workerDispatch } from './worker-dispatch.js';
import { workerInstance } from './worker-instance.js';

export const WORKER_DISPATCH = workerDispatch(workerInstance(workerConstructor()));
