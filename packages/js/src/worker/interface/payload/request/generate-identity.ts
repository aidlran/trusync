import type { KdfType } from '../../../../crypto/kdf/types.js';

export interface GenerateIdentityRequest {
  type: KdfType;
}
