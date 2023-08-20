import type { KMS, HybridNS, SessionNS } from '../kms/primary';

export type ConfiguredKMS = KMS & {
  hybrid: HybridNS;
  keys: SessionNS;
};
