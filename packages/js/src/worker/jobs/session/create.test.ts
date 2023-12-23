import ecc from '@bitcoinerlab/secp256k1';
import { BIP32Factory } from 'bip32';
import { expect, expectTypeOf, it } from 'vitest';
import { create } from './create.js';

const createWithMocks = (options: any) => {
  return create(
    () => Promise.resolve(0),
    () => Promise.resolve(BIP32Factory(ecc).fromSeed(Buffer.from(new Uint8Array(16)))),
    options,
  );
};

it('returns a valid result', () => {
  const job = createWithMocks({ passphrase: 'test' });
  expectTypeOf(job).resolves.toHaveProperty('result').toHaveProperty('mnemonic').toBeString();
});

it('throws if no options object given', () => {
  const job = createWithMocks(undefined);
  void expect(job).rejects.toThrow(TypeError);
});

it('disallows blank passphrases', () => {
  const job = createWithMocks({});
  void expect(job).rejects.toThrow(TypeError);
});
