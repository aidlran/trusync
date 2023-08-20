import { DELETE, GET, POST, PUT } from '../../shared/http/index.js';
import { KMS } from '../../shared/kms/index.js';
import type { Data } from './interfaces/data.js';
import type { DataCreate } from './interfaces/data-create.js';

const URL_BASE = 'data';

async function decrypt(encryptedData: Data) {
  // TODO: optimise - resolve the moment a key successfully unlocks it

  const decryptResults = await Promise.allSettled(
    encryptedData.keys.map((key) =>
      KMS.hybrid
        .decrypt({
          kmsKeyID: key.keyPairID,
          payload: encryptedData.payload,
          payloadKey: key.encryptedDataKey,
        })
        .then((result) => JSON.parse(result.payload) as object),
    ),
  );

  const decrypted = decryptResults.find((result) => {
    return result.status === 'fulfilled';
  }) as PromiseFulfilledResult<object> | undefined;

  // TODO: dedicated error inherited classes
  // TODO: different error if JSON fails to parse

  if (!decrypted) throw new Error(`No decryption key for ${encryptedData.id}`);

  return { id: encryptedData.id, ...decrypted.value };
}

async function encrypt(payload: object, keyID?: string): Promise<DataCreate> {
  if (!keyID) {
    if (KMS.keys.importedKeyIDs.length) {
      keyID = KMS.keys.importedKeyIDs[0];
    } else {
      throw Error('No key pairs available.');
    }
  }

  const encryptResult = await KMS.hybrid.encrypt({
    kmsKeyID: keyID,
    payload: JSON.stringify(payload),
  });

  return {
    encryptedReadKey: encryptResult.payloadKey,
    ownerKeyPairID: keyID,
    payload: encryptResult.payload,
  };
}

export function create(payload: object, keyID?: string) {
  return encrypt(payload, keyID).then((data) => POST<{ id: string }>(`me/${URL_BASE}`, data));
}

export function deleteByID(id: string) {
  return DELETE(`${URL_BASE}/${id}`);
}

export function deleteManyByID(ids: string[]) {
  return Promise.allSettled(ids.map(deleteByID));
}

export function replaceByID(id: string, payload: object, keyID?: string) {
  return encrypt(payload, keyID).then((data) => PUT<{ id: string }>(`${URL_BASE}/${id}`, data));
}

export function getAllOwn(): Promise<object[]> {
  return GET<Data[]>(`me/${URL_BASE}`).then((myData) => Promise.all(myData.map(decrypt)));
}

export async function getByID(id: string): Promise<object> {
  return GET<Data>(`${URL_BASE}/${id}`).then(decrypt);
}

export function pullRootData(appID: number) {
  return GET<Data>(`${URL_BASE}/root/${appID}`).then(decrypt);
}

export function pushRootData(payload: object, appID: number, keyID?: string) {
  return encrypt(payload, keyID).then((data) => POST(`${URL_BASE}/root/${appID}`, data));
}
