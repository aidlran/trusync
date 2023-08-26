import { getContext } from 'svelte';
import type { TrusyncApp } from 'trusync';
import { APP_KEY } from '$lib/constants/context-keys';

export function app(): TrusyncApp {
  return getContext(APP_KEY);
}
