import { expect, expectTypeOf, it } from 'vitest';
import { create } from './create.js';

it('returns a valid result', () => {
  const options = { passphrase: 'test' };
  const job = create(options);
  expectTypeOf(job).resolves.toHaveProperty('mnemonic').toBeString();
});

it('throws if no options object given', () => {
  const options = undefined;
  const job = create(options as never);
  void expect(job).rejects.toThrow(TypeError);
});

it('disallows blank passphrases', () => {
  const options = {};
  const job = create(options as never);
  void expect(job).rejects.toThrow(TypeError);
});
