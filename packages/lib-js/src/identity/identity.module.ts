import { data } from '../data/index.js';
import { createModule } from '../module/create-module.js';
import { generate } from './function/generate.js';

export const identityModule = createModule('identity', (key) => {
  const dataModule = data(key);
  return {
    generate: () => generate(dataModule),
  };
});
