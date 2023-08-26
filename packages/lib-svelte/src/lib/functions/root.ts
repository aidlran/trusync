import type { DataStores } from '../classes/data-stores.js';
import { DATA_STORES_KEY } from '../constants/context-keys.js';
import type { DataStore } from '../interfaces/data-store.js';
import { getContext } from 'svelte';

export function root<T extends { id: string }>(appID: number): DataStore<T> {
  return getContext<DataStores>(DATA_STORES_KEY).getRoot<T>(appID);
}
