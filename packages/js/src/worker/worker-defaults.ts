export const CLUSTER_SIZE_DEFAULT_CEILING = 4;
export const CLUSTER_SIZE_DEFAULT_FLOOR = 1;
export const CLUSTER_SIZE_DEFAULT_MULTIPLIER = 0.5;

/**
 * The default number of workers active in the cluster. It scales with the
 * `navigator.hardwareConcurrency` value when available.
 */
export const CLUSTER_SIZE_DEFAULT = calculateClusterSize();

export function calculateClusterSize(
  ceiling = CLUSTER_SIZE_DEFAULT_CEILING,
  floor = CLUSTER_SIZE_DEFAULT_FLOOR,
  multiplier = CLUSTER_SIZE_DEFAULT_MULTIPLIER,
) {
  return Math.min(
    Math.max(Math.floor(navigator.hardwareConcurrency ?? 1 * multiplier), floor),
    ceiling,
  );
}
