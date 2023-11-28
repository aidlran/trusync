import { channelModule } from '../channel/channel.module.js';
import { createModule } from '../module/create-module.js';
import { create } from './function/create.js';

export const schemaModule = createModule((key) => {
  const channels = channelModule(key);
  return {
    create<T>() {
      return create<T>(channels);
    },
  };
});
