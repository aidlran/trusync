import type { Readable } from 'svelte/store';

export interface DataStore<T> extends Readable<T> {
  put: (update: T) => void;
}
