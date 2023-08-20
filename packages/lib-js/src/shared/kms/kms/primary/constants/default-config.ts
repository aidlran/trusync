import type { KmsConfig } from '../interfaces/kms-config.js';

/** Default KMS config. */
export const DEFAULT_CONFIG: KmsConfig = {
  clusterSize: 4 as const,
};
