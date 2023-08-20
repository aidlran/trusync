import { KMS, HybridNS, SessionNS } from '../kms/primary';
import type { ConfiguredKMS } from '../types/configured-kms.js';

export function createConfiguredKMS() {
  return new KMS(
    () =>
      new Worker(new URL('../worker/worker.js?worker', import.meta.url), {
        type: 'module',
      }),
    {
      clusterSize: 2,
      hybrid: HybridNS,
      keys: SessionNS,
    },
  ) as ConfiguredKMS;
}
