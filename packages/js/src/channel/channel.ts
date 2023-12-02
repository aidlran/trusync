import type { Hash } from './interfaces/hash.js';
import type { RawData } from './interfaces/raw-data.js';

type MaybePromise<T = void> = T | Promise<T>;
type GetResult<T> = MaybePromise<T | null | undefined>;

/** Interface for a channel implementation. */
export interface Channel {
  deleteNode: (hash: Hash) => MaybePromise;
  getNode: (hash: Hash) => GetResult<RawData>;
  putNode: (rawData: RawData) => MaybePromise;
  unsetAddressedNode: (name: string) => MaybePromise;
  getAddressedNodeHash: (name: string) => GetResult<Hash>;
  setAddressedNodeHash: (name: string, hash: Hash) => MaybePromise;
}
