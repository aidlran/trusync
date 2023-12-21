import { sha256 } from '../hash/sha256.js';
import WORDLIST from './bip39-wordlist-english.json';

/**
 * Generate a BIP39 mnemonic code.
 *
 * @param entropy Valid values are 128, 160, 192, 224, or 256 bits in length. Greater entropy
 *   lengths result in greater security but greater sentence length.
 * @returns A 12 to 24 word mnemonic.
 */
export async function entropyToMnemonic(entropy: Uint8Array): Promise<string> {
  if (![16, 20, 24, 28, 32].includes(entropy.length)) {
    throw TypeError('Entropy length must be must be 128 | 160 | 192 | 224 | 256 bits');
  }

  const CHECKSUM_LENGTH = entropy.length / 4;

  const CHECKSUM = sha256(entropy).then(({ value }) => {
    const SHIFT = 8 - CHECKSUM_LENGTH;
    const BITMASK = CHECKSUM_LENGTH == 8 ? 0xff : (0xff >> SHIFT) << SHIFT;
    return value[0] & BITMASK;
  });

  let mnemonicInt = 0n;

  for (const BYTE of entropy) {
    mnemonicInt = (mnemonicInt << 8n) + BigInt(BYTE);
  }

  mnemonicInt = (mnemonicInt << BigInt(CHECKSUM_LENGTH)) | BigInt(await CHECKSUM);

  let mnemonicString = '';
  const BITMASK = (1n << 11n) - 1n;

  while (mnemonicInt > 0n) {
    mnemonicString = `${WORDLIST[Number(mnemonicInt & BITMASK)]} ${mnemonicString}`;
    mnemonicInt >>= 11n;
  }

  return mnemonicString;
}

export async function mnemonicToSeed(mnemonic: string, passphrase = ''): Promise<ArrayBuffer> {
  const ENCODER = new TextEncoder();

  const MNEMONIC = ENCODER.encode(mnemonic);
  const SALT = ENCODER.encode(`mnemonic${passphrase}`);

  const BASE_KEY = await crypto.subtle.importKey('raw', MNEMONIC, 'PBKDF2', false, ['deriveBits']);

  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-512',
      iterations: 2048,
      salt: SALT,
    },
    BASE_KEY,
    512,
  );
}
