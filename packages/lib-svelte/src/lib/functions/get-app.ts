import { getContext } from 'svelte';
import { APP_KEY } from '$lib/constants/context-keys';
import type { TrusyncAppStore } from '$lib/types/trusync-app-store.type';

export function getApp(): TrusyncAppStore {
  return getContext(APP_KEY);
}
