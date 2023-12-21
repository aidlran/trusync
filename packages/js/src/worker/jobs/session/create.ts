import { sha256 } from '../../../crypto/hash/sha256.js';
import type { CreateSessionResult } from '../../interface/payload/index.js';
import type { Job } from '../../types/job.js';
import WORDLIST from './bip39-english.json';

export const create = async (job: Job<'session.create'>): Promise<CreateSessionResult> => {
  const phrase = await generateMnemonic(128);

  console.log(phrase);

  return {
    phrase,
  };
};

/**
 * Generate a BIP39 mnemonic code.
 *
 * @param entropyLength Entropy length. Greater entropy lengths result in greater security but
 *   greater sentence length.
 * @returns A 12 to 24 word mnemonic.
 */
async function generateMnemonic(entropyLength: 128 | 160 | 192 | 224 | 256): Promise<string[]> {
  switch (entropyLength) {
    case 128:
    case 160:
    case 192:
    case 224:
    case 256:
      break;
    default:
      throw new TypeError('ENT must be 128 | 160 | 192 | 224 | 256');
  }

  const CHECKSUM_LENGTH = entropyLength / 32;

  const ENTROPY_BYTES = crypto.getRandomValues(new Uint8Array(entropyLength / 8));

  const CHECKSUM = sha256(ENTROPY_BYTES).then(({ value }) => {
    // if (CS > 8) throw TypeError('CS must be < 8');
    const SHIFT = 8 - CHECKSUM_LENGTH;
    const BITMASK = CHECKSUM_LENGTH == 8 ? 0xff : (0xff >> SHIFT) << SHIFT;
    return value[0] & BITMASK;
  });

  let mnemonicInt = 0n;

  for (const byte of ENTROPY_BYTES) {
    mnemonicInt = (mnemonicInt << 8n) + BigInt(byte);
  }

  mnemonicInt = (mnemonicInt << BigInt(CHECKSUM_LENGTH)) | BigInt(await CHECKSUM);

  const MNEMONIC = new Array<string>();
  const BITMASK = (1n << 11n) - 1n;

  while (mnemonicInt > 0n) {
    MNEMONIC.unshift(WORDLIST[Number(mnemonicInt & BITMASK)]);
    mnemonicInt >>= 11n;
  }

  return MNEMONIC;
}
