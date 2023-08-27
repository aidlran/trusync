import { EnclaveKmsError } from '../../shared/errors/enclave-kms.error.js';
import type { Action, Request, Result } from '../../shared/types/index.js';
import { DEFAULT_CONFIG } from '../constants/default-config.js';
import type { KmsConfig } from '../interfaces/kms-config.js';
import { ManagedWorker } from './managed-worker.js';

export class KMS {
  private readonly cluster: ManagedWorker[];

  private currentWorker = 0;

  readonly asymmetric;
  readonly hybrid;
  readonly keys;
  readonly symmetric;

  constructor(workerConstructor: () => Worker, config?: KmsConfig) {
    const clusterSize = config?.clusterSize ?? DEFAULT_CONFIG.clusterSize;

    if (!clusterSize || clusterSize <= 0) {
      throw new EnclaveKmsError('Invalid cluster size.');
    }

    this.cluster = Array.from(
      { length: clusterSize },
      () => new ManagedWorker(workerConstructor()),
    );

    if (config?.asymmetric)
      this.asymmetric = new config.asymmetric(this.postJobSingle, this.postJobAll);
    if (config?.hybrid) this.hybrid = new config.hybrid(this.postJobSingle, this.postJobAll);
    if (config?.keys) this.keys = new config.keys(this.postJobSingle, this.postJobAll);
    if (config?.symmetric)
      this.symmetric = new config.symmetric(this.postJobSingle, this.postJobAll);
  }

  private readonly postJobSingle = (async <T extends Action>(
    request: Request<T>,
  ): Promise<Result<T>> => {
    return this.cluster[
      (this.currentWorker = ++this.currentWorker >= this.cluster.length ? 0 : this.currentWorker)
    ].postJob(request);
  }).bind(this);

  private readonly postJobAll = (async <T extends Action>(
    request: Request<T>,
  ): Promise<Result<T>[]> => {
    return Promise.all(this.cluster.map((managedWorker) => managedWorker.postJob(request)));
  }).bind(this);
}
