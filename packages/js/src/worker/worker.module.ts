import { createModule } from '../module/create-module.js';
import { workerConstructor } from './worker-constructor.js';
import { workerDispatch } from './worker-dispatch.js';
import { workerInstance } from './worker-instance.js';

export const workerModule = createModule(() => workerDispatch(workerInstance(workerConstructor())));
