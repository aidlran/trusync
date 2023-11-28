import { createModule } from '../module/create-module.js';
import { schema } from '../schema/index.js';
import { type Identity } from './interface/identity.js';
import { generate } from './function/generate.js';

export const identityModule = createModule((key) => {
  const schemaModule = schema(key);
  const createIdentityNode = schemaModule.create<Identity>();
  return {
    generate() {
      return generate(createIdentityNode);
    },
  };
});
