import '@vitest/web-worker';
import { expect, it } from 'vitest';
import { workerConstructor } from './worker-constructor.js';

it('constructs', () => expect(workerConstructor()()).toBeInstanceOf(Worker));
