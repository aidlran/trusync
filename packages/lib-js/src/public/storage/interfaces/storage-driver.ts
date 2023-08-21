type MaybePromise<T> = T | Promise<T>;
type GetResult = string | null | undefined;

export interface StorageDriver {
  deleteData: (id: string) => MaybePromise<void>;
  getData: (id: string) => MaybePromise<GetResult>;
  putData: (id: string, data: string) => MaybePromise<void>;
  deleteNamedData: (name: string) => MaybePromise<void>;
  getNamedDataID: (name: string) => MaybePromise<GetResult>;
  setNamedData: (name: string, id: string) => MaybePromise<void>;
}
