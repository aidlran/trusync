import type { Readable } from 'svelte/store';
import type { TrusyncApp } from 'trusync';

export type TrusyncAppStore = Readable<TrusyncApp>;
