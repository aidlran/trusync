import { Hash } from './hash.js';
import { RawData } from './raw-data.js';

type MaybePromise<T> = T | Promise<T>;
type GetResult<T> = T | null | undefined;

export interface StorageDriver {
  deleteData: (hash: Hash) => MaybePromise<void>;
  getData: (hash: Hash) => MaybePromise<GetResult<RawData>>;
  putData: (rawData: RawData) => MaybePromise<void>;
  unsetNamedDataHash: (name: string) => MaybePromise<void>;
  getNamedDataHash: (name: string) => MaybePromise<GetResult<Hash>>;
  setNamedDataHash: (name: string, hash: Hash) => MaybePromise<void>;
}
