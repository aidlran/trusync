import { getChannels } from '../index.js';
import { moduleProvider } from '../modules/module-provider.js';
import { Data } from './data.js';

export * from './channel/index.js';
export * from './data.js';

export const data = moduleProvider('data', (key) => new Data(getChannels(key)));

export default data;
