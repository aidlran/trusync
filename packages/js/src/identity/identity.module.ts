import { createModule } from '../module/create-module.js';
import { createSchema } from '../schema/index.js';
import { type Identity } from './interface/identity.js';
import { generate } from './function/generate.js';

export const identityModule = createModule((key) => {
  const identitySchema = createSchema<Identity>(key);
  return {
    generate() {
      return generate(identitySchema);
    },
  };
});
