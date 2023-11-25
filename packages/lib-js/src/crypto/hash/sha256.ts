import { toBufferSource } from '../common/buffer-utils.js';
import { HashType, type Hash } from './types.js';

export async function sha256(payload: string | BufferSource): Promise<Hash> {
  const byteArray = toBufferSource(payload);
  const digest = await self.crypto.subtle.digest('SHA-256', byteArray);
  return {
    type: HashType.SHA256,
    value: new Uint8Array(digest),
  };
}
