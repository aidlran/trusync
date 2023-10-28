import { type Readable, writable } from 'svelte/store';
import { type ActiveSession, getSessions, setOnActiveSessionChange } from 'trusync';

export const activeSessionStore: Readable<ActiveSession | undefined> = (() => {
  const { update, subscribe } = writable<ActiveSession | undefined>();
  setOnActiveSessionChange((session) => update(() => session));
  void getSessions();
  return { subscribe };
})();
