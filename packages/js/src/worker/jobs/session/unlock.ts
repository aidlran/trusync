import type { BIP32Interface } from 'bip32';
import type { UnlockSessionRequest } from '../../interface/payload/index.js';

/* eslint-disable @typescript-eslint/no-unused-vars */

export const unlock = async (
  _activate: (mnemonic: string, passphrase: string) => Promise<BIP32Interface>,
  _request: UnlockSessionRequest,
) => {
  await Promise.reject(new Error('Not implemented'));
};
