import { DELETE, GET, POST, PUT } from '../../shared/http/index.js';
import { KMS } from '../../shared/kms/index.js';
import type { User } from '../user/interfaces/user.js';

const URL_BASE = 'session';

export async function destroy() {
  await Promise.allSettled([KMS.keys.destroySession(), DELETE(URL_BASE)]);
}

export function retrieveSessionDataPayload() {
  return GET<{ payload: string }>(URL_BASE);
}

export async function signInWithCredentials(identifier: string, passphrase: string) {
  const result = await POST<{ user: User }>(URL_BASE, {
    identifier,
    passphrase,
  });

  if (result.message) {
    throw new Error(result.message);
  }

  await Promise.all(
    result.user.keyPairs.map(async (keyPair) => {
      const { id: keyID, privateKey, publicKey } = keyPair;
      await KMS.keys.import({
        keyID,
        privateKey,
        publicKey,
        secret: passphrase,
      });
    }),
  );

  await updateSessionData().catch(() => {
    /* empty */
  });

  return result;
}

export async function updateSessionData() {
  const { sessionPayload } = await KMS.keys.exportSession();
  return PUT(URL_BASE, { payload: sessionPayload });
}

export async function resume() {
  if (KMS.keys.importedKeyIDs.length) {
    throw new Error('Keys have already been imported. Destroy the current session first.');
  }

  const retrievedSession = await GET<{ payload: string }>(URL_BASE);

  if (retrievedSession.message) {
    await destroy();
    throw new Error(retrievedSession.message);
  }

  const importResult = await KMS.keys.importSession({
    reexport: true,
    sessionPayload: retrievedSession.payload,
  });

  updateSessionData().catch(() => {
    //
  });

  return importResult.importedKeyIDs;
}
