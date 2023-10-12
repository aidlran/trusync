import type { AsymmetricCryptPayload } from './asymmetric-crypt-payload';

/** @deprecated */
export interface HybridDecryptRequest extends AsymmetricCryptPayload {
  /** The encrypted session key originally used to encrypt the payload. */
  payloadKey: string;
}
