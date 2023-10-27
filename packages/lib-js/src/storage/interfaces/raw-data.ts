import type { Hash } from './hash.js';

export interface RawData {
  hash: Hash;
  encoding: string;
  mediaType: string;
  payload: string;
}
