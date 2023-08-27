import { KMS as BaseKMS, HybridNS, SessionNS } from './primary';

export type KMS = BaseKMS & {
  hybrid: HybridNS;
  keys: SessionNS;
};

export function configuredKMS(): KMS {
  return new BaseKMS(
    () =>
      new Worker(new URL('./worker/worker.js?worker', import.meta.url), {
        type: 'module',
      }),
    {
      clusterSize: Math.min(Math.ceil(navigator.hardwareConcurrency / 2) || 1, 4),
      hybrid: HybridNS,
      keys: SessionNS,
    },
  ) as KMS;
}
