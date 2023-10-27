import { toBufferSource } from '../common/buffer-utils.js';

export async function sha256(payload: string | BufferSource): Promise<Uint8Array> {
  const byteArray = toBufferSource(payload);
  const digest = await self.crypto.subtle.digest('SHA-256', byteArray);
  return new Uint8Array(digest);
}
