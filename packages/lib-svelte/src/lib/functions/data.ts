import { getContext } from 'svelte';
import type { DataStores } from '../classes/data-stores.js';
import { DATA_STORES_KEY } from '../constants/constants.js';
import type { DataStore } from '../interfaces/data-store.js';

export function data<T extends { id: string }>(id: string): DataStore<T> {
  return getContext<DataStores>(DATA_STORES_KEY).getByID<T>(id);
}
