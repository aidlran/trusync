import { writable } from 'svelte/store';
import type { TrusyncApp } from 'trusync';
import type { TrusyncAppStore } from '$lib/types/trusync-app-store.type';

export function trusyncAppStore(app: TrusyncApp): TrusyncAppStore {
  const { update, subscribe } = writable(app);

  app.onIdentityChange = () => update(() => app);

  return { subscribe };
}
