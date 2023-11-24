import { getChannels } from '../index.js';
import { createModule } from '../module/create-module.js';
import { Data } from './data.js';

export * from './channel/index.js';
export * from './data.js';

export const data = createModule('data', (key) => new Data(getChannels(key)));

export default data;
