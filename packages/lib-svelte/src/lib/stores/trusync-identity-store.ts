import { writable, type Readable } from 'svelte/store';
import type { Identity } from 'trusync';

export type IdentityStore = Readable<Omit<Identity, 'onChange'>>;

export function identityStore(identity: Identity): IdentityStore {
  const { update, subscribe } = writable(identity);
  identity.onChange = (identity: Identity) => update(() => identity);
  return { subscribe };
}
