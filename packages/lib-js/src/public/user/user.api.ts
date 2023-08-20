import { POST } from '../../shared/http/index.js';
import { KMS } from '../../shared/kms/index.js';
import type { IKeyPairCreate } from '../key-pair/interfaces/key-pair-create.js';
import { updateSessionData } from '../session/index.js';
import type { User } from './interfaces/user.js';
import type { IUserCreate } from './interfaces/user-create.js';

const URL_BASE = 'user';

export async function create(user: IUserCreate) {
  const keyPair = await KMS.keys.generateKeyPair({ secret: user.passphrase });

  const payload: IUserCreate & IKeyPairCreate = {
    ...keyPair,
    ...user,
  };

  const result = await POST<{ user: User }>(URL_BASE, payload);

  if (result.errors) {
    throw new Error(Object.values(result.errors)[0]?.[0] ?? 'Unexpected error');
  }

  await Promise.all(
    result.user.keyPairs.map(async (keyPair) => {
      const { id: keyID, privateKey, publicKey } = keyPair;
      await KMS.keys.import({
        keyID,
        privateKey,
        publicKey,
        secret: user.passphrase,
      });
    }),
  );

  await updateSessionData().catch(() => {
    /* empty */
  });

  return result;
}
