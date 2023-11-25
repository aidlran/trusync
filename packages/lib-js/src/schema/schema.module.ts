import { getChannels } from '../data/index.js';
import { createModule } from '../module/create-module.js';
import { create } from './function/create.js';

export const schemaModule = createModule((key) => {
  const channels = getChannels(key);
  return {
    create<T>() {
      return create<T>(channels);
    },
  };
});
