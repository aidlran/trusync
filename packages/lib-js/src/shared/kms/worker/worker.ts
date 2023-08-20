import { Worker } from '../kms/worker/classes/worker.js';
import Adapter from '../kms/worker/adapters/openpgp.js';

new Worker(new Adapter());
