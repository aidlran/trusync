import { createModule } from '../module/create-module.js';
import { Observable, type ObservableCallback } from '../observable/observable.js';
import { workerModule } from '../worker/worker.module.js';
import { construct as constructClear, type SessionClearFn } from './function/clear.js';
import { construct as constructCreate, type SessionCreateFn } from './function/create.js';
import { getSessions } from './function/get-sessions.js';
import { construct as constructImport, type SessionImportFn } from './function/import.js';
import { construct as constructLoad, type SessionLoadFn } from './function/load.js';
import type { ActiveSession, AllSessions } from './types.js';

export interface SessionModule<T = unknown> {
  clear: SessionClearFn;
  create: SessionCreateFn<T>;
  getSessions(callback?: (sessions: Readonly<AllSessions>) => unknown): void;
  import: SessionImportFn<T>;
  load: SessionLoadFn<T>;
  /** @returns An unsubscribe function. */
  onActiveSessionChange(callback: ObservableCallback<ActiveSession | undefined>): () => void;
  /** @returns An unsubscribe function. */
  onSessionsChange(callback: ObservableCallback<AllSessions>): () => void;
}

const getSessionModule = createModule((appID) => {
  const WORKER_MODULE = workerModule(appID);

  const ALL_SESSIONS = new Observable<AllSessions>({});
  const ACTIVE_SESSION = new Observable<ActiveSession | undefined>(undefined);

  const load = constructLoad(WORKER_MODULE, ACTIVE_SESSION, ALL_SESSIONS);

  const SESSION_MODULE: SessionModule = {
    clear: constructClear(WORKER_MODULE, ALL_SESSIONS, ACTIVE_SESSION),
    create: constructCreate(WORKER_MODULE, load, ALL_SESSIONS),
    import: constructImport(WORKER_MODULE, load, ALL_SESSIONS),
    load,

    getSessions(callback?: (sessions: Readonly<AllSessions>) => unknown): void {
      getSessions(ALL_SESSIONS, () => {
        if (callback) callback(ALL_SESSIONS.get());
      });
    },

    // TODO: simply expose a readonly version of the observables
    onActiveSessionChange: (callback) => ACTIVE_SESSION.subscribe(callback),
    onSessionsChange: (callback) => ALL_SESSIONS.subscribe(callback),
  };

  return SESSION_MODULE;
});

export const getTypedSessionModule = <T = unknown>(appID?: string): SessionModule<T> => {
  return getSessionModule(appID) as SessionModule<T>;
};
