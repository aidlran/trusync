import { channelModule } from '../channel/channel.module.js';
import { createModule } from '../module/create-module.js';
import { Data } from './data.js';

export type * from './data.js';

export const data = createModule((key) => new Data(channelModule(key)));

export default data;
