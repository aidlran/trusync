import { channelModule } from '../channel/channel.module.js';
import { createModule } from '../module/create-module.js';
import { create } from './function/create.js';

export const createSchema = <T = unknown>(appID?: string) =>
  createModule((key) => create<T>(channelModule(key)))(appID);
