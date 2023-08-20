import { setContext } from 'svelte';
import { DATA_STORES_KEY } from '../constants/constants.js';
import { DataStores } from '../classes/data-stores.js';

export function init(): void {
  setContext(DATA_STORES_KEY, new DataStores());
}
