import { entropyToMnemonic, mnemonicToSeed } from '../../../crypto/mnemonic/bip39.js';
import type { CreateSessionRequest, CreateSessionResult } from '../../interface/payload/index.js';

export const create = async (request: CreateSessionRequest): Promise<CreateSessionResult> => {
  if (!request.passphrase) throw new TypeError('passphrase cannot be blank');

  const entropy = crypto.getRandomValues(new Uint8Array(16));
  const mnemonic = await entropyToMnemonic(entropy);
  const seed = await mnemonicToSeed(mnemonic, request.passphrase);

  // TODO: save the entropy in session payload, everything can be derived from it (with passphrase)

  return { mnemonic };
};
