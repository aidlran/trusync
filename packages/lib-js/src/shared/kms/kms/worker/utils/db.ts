// TODO: @enclavetech/kv lib

function kvStoreOpen(): Promise<IDBObjectStore> {
  return new Promise<IDBObjectStore>((resolve, reject) => {
    const openRequest = indexedDB.open('enclave_km', 1);

    openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      (event.target as IDBOpenDBRequest).result.createObjectStore('kv', {
        keyPath: 'key',
      });
    };

    openRequest.onerror = (errorEvent: Event) => {
      reject((errorEvent.target as IDBOpenDBRequest).error);
    };

    openRequest.onsuccess = (event: Event) => {
      resolve(
        (event.target as IDBOpenDBRequest).result.transaction('kv', 'readwrite').objectStore('kv'),
      );
    };
  });
}

export async function kvStoreDelete(key: string): Promise<void> {
  const kvStore = await kvStoreOpen();
  return new Promise<void>((resolve, reject) => {
    const deleteRequest = kvStore.delete(key);

    deleteRequest.onerror = (errorEvent: Event) => {
      reject((errorEvent.target as IDBRequest).error);
    };

    deleteRequest.onsuccess = () => {
      resolve();
    };
  });
}

export async function kvStoreGet(key: string): Promise<string> {
  const kvStore = await kvStoreOpen();
  return new Promise<string>((resolve, reject) => {
    const getRequest = kvStore.get(key);

    getRequest.onerror = (errorEvent: Event) => {
      reject((errorEvent.target as IDBRequest).error);
    };

    getRequest.onsuccess = () => {
      resolve((getRequest.result as { key: string; value: string }).value);
    };
  });
}

export async function kvStoreSet(key: string, value: string): Promise<void> {
  const kvStore = await kvStoreOpen();
  return new Promise<void>((resolve, reject) => {
    const putRequest = kvStore.put({ key, value });

    putRequest.onerror = (errorEvent: Event) => {
      reject((errorEvent.target as IDBRequest).error);
    };

    putRequest.onsuccess = () => {
      resolve();
    };
  });
}
