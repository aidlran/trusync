import type { BIP32Interface } from 'bip32';
import { entropyToMnemonic } from '../../../crypto/mnemonic/bip39.js';
import type { CreateSessionRequest, CreateSessionResult } from '../../interface/payload/index.js';

export const create = async (
  save: (
    payload: Uint8Array,
    passphrase: string,
    metadata: unknown,
    id?: number,
  ) => Promise<number>,
  activate: (mnemonic: string, passphrase: string) => Promise<BIP32Interface>,
  request: CreateSessionRequest,
): Promise<{ node: BIP32Interface; result: CreateSessionResult }> => {
  if (!request.passphrase) throw new TypeError('passphrase cannot be blank');
  const entropy = crypto.getRandomValues(new Uint8Array(16));
  const mnemonic = await entropyToMnemonic(entropy);
  const [id, node] = await Promise.all([
    save(entropy, request.passphrase, request.metadata),
    activate(mnemonic, request.passphrase),
  ]);
  return { node, result: { mnemonic, id } };
};
