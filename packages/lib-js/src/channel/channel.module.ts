import { createModule } from '../module/create-module.js';
import type { Channel } from './channel.js';

export const channelModule = createModule(() => new Array<Channel>());
