import { getContext } from 'svelte';
import { APP_KEY } from '$lib/constants/context-keys';

export function app() {
  return getContext(APP_KEY);
}
