import { entropyToMnemonic, mnemonicToSeed } from '../../../crypto/mnemonic/bip39.js';
import type { CreateSessionRequest, CreateSessionResult } from '../../interface/payload/index.js';

export const create = async (request: CreateSessionRequest): Promise<CreateSessionResult> => {
  const mnemonic = await entropyToMnemonic(crypto.getRandomValues(new Uint8Array(16)));
  const seed = await mnemonicToSeed(mnemonic, request.passphrase ?? '');

  console.log(mnemonic, seed);

  return { mnemonic };
};
