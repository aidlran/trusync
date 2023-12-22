import { expectTypeOf, test } from 'vitest';
import { create } from './create.js';

test('worker/jobs/session/create', () => {
  const job = create({});
  expectTypeOf(job).resolves.toHaveProperty('mnemonic').toBeString();
});
