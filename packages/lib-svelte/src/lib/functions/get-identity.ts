import { getContext } from 'svelte';
import { IDENTITY_KEY } from '../constants/context-keys';
import type { IdentityStore } from '../stores/trusync-identity-store';

export function getIdentity(): IdentityStore {
  return getContext(IDENTITY_KEY);
}
