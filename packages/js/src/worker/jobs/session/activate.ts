import ecc from '@bitcoinerlab/secp256k1';
import { type BIP32API, BIP32Factory } from 'bip32';
import { Buffer } from 'buffer';
import { mnemonicToSeed } from '../../../crypto/mnemonic/bip39.js';

let bip32: BIP32API;

export const activate = async (mnemonic: string, passphrase: string) => {
  bip32 ??= BIP32Factory(ecc);
  const seed = await mnemonicToSeed(mnemonic, passphrase);
  const node = bip32.fromSeed(Buffer.from(seed));
  return node;
};
