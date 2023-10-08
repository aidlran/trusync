import type { Hash } from './hash';

export interface RawData {
  hash: Hash;
  encoding: string;
  mediaType: string;
  payload: string;
}
