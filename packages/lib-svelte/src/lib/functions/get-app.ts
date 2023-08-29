import { getContext } from 'svelte';
import type { Readable } from 'svelte/store';
import type { TrusyncApp } from 'trusync';
import { APP_KEY } from '$lib/constants/context-keys';

export function getApp(): Readable<TrusyncApp> {
  return getContext(APP_KEY);
}
