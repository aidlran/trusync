import { type Readable, writable } from 'svelte/store';
import { type Sessions, setOnChange, getSessions } from 'trusync';

export const allSessionsStore: Readable<Sessions | undefined> = (() => {
  const { update, subscribe } = writable<Sessions>();
  setOnChange((sessions) => update(() => sessions));
  void getSessions();
  return { subscribe };
})();
