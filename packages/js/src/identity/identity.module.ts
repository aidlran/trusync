import { createModule } from '../module/create-module.js';
import { createSchema } from '../schema/schema.module.js';
import { generate } from './function/generate.js';
import type { Identity } from './interface/identity.js';

export const getIdentityModule = createModule((key) => {
  const identitySchema = createSchema<Identity>(key);
  return {
    generate() {
      return generate(identitySchema);
    },
  };
});
