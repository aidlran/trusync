import { Worker } from './classes/worker.js';
import Adapter from './adapters/openpgp.js';

new Worker(new Adapter());
