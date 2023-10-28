import { type Readable, writable } from 'svelte/store';
import { type Sessions, setOnSessionsChange, getSessions } from 'trusync';

export const allSessionsStore: Readable<Sessions | undefined> = (() => {
  const { update, subscribe } = writable<Sessions>();
  setOnSessionsChange((sessions) => update(() => sessions));
  void getSessions();
  return { subscribe };
})();
