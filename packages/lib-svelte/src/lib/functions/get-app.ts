import { getContext } from 'svelte';
import type { TrusyncApp } from 'trusync';
import { APP_KEY } from '../constants/context-keys';

export function getApp(): TrusyncApp {
  return getContext(APP_KEY);
}
