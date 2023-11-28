import { type Readable, writable } from 'svelte/store';
import {
  type ActiveSession,
  type Sessions,
  getSessions,
  setOnSessionsChange,
  setOnActiveSessionChange,
} from 'trusync';

export const activeSessionStore: Readable<ActiveSession | undefined> = (() => {
  const { update, subscribe } = writable<ActiveSession | undefined>();
  setOnActiveSessionChange((session) => update(() => session));
  if (globalThis.window) void getSessions();
  return { subscribe };
})();

export const allSessionsStore: Readable<Sessions | undefined> = (() => {
  const { update, subscribe } = writable<Sessions>();
  setOnSessionsChange((sessions) => update(() => sessions));
  if (globalThis.window) void getSessions();
  return { subscribe };
})();
