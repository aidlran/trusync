import data from '../data/index.js';
import { moduleProvider } from '../modules/module-provider.js';
import { identityFactory } from './factory.js';

export const identity = moduleProvider('identity', (key) => identityFactory(data(key)));

export default identity;
