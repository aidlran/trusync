import type { Hash } from '../interfaces/hash';

export type HashKey = string;

export function getHashKey(hash: Hash): HashKey {
  return `${hash.algorithm}:${hash.value}`;
}

export function getHash(hashKey: HashKey): Hash {
  const [algorithm, value] = hashKey.split(':');
  return { algorithm, value };
}
