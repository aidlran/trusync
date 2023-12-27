import { mnemonicToEntropy } from '../../../crypto/mnemonic/bip39.js';
import type { ImportSessionRequest } from '../../interface/payload/index.js';
import type { ImportSessionResult } from '../../interface/payload/result/import-session.js';

export const importSession = async (
  save: (
    payload: Uint8Array,
    passphrase: string,
    metadata: unknown,
    id?: number,
  ) => Promise<number>,
  request: ImportSessionRequest,
): Promise<ImportSessionResult> => {
  if (!request.passphrase) throw new TypeError('passphrase cannot be blank');
  const entropy = mnemonicToEntropy(request.mnemonic);
  const id = await save(entropy, request.passphrase, request.metadata);
  return { id };
};
