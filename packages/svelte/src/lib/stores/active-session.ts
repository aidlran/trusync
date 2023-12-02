import { type Readable, readable, writable } from 'svelte/store';
import { type ActiveSession, session } from 'trusync';

// TODO: lazy create stores by appID, cache and re-return them
//       maybe just use createModule from core package

export function activeSession(appID?: string): Readable<ActiveSession | undefined> {
  if (!globalThis.window) {
    return readable();
  }

  // https://svelte.dev/docs/svelte-store#writable
  const { update, subscribe } = writable<ActiveSession | undefined>(undefined, () => {
    // "[...] called when the number of subscribers goes from zero to one [...]"
    // "[...] return a stop function that is called when the subscriber count goes from one to zero."
    return session(appID).onActiveSessionChange((session) => {
      update(() => session);
    });
  });

  return { subscribe };
}
