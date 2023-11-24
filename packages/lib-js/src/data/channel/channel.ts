import { createModule } from '../../module/create-module.js';
import type { Hash } from '../../storage/interfaces/hash.js';
import type { RawData } from '../../storage/interfaces/raw-data.js';

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

/**
 * @param key The target protocol instance's key.
 * @returns The protocol's channel set.
 */
export const getChannels = createModule('channel', () => new Array<Channel>());
