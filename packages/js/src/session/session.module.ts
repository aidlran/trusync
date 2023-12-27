import { createModule } from '../module/create-module.js';
import { Observable, type ObservableCallback } from '../observable/observable.js';
import { workerModule } from '../worker/worker.module.js';
import { clearSession } from './function/clear-session.js';
import { constructCreateSession } from './function/create-session.js';
import { getSessions } from './function/get-sessions.js';
import { constructImportSession } from './function/import-session.js';
import { constructLoadSession } from './function/load-session.js';
import type { ActiveSession, AllSessions } from './types.js';

export const getSessionModule = <T = unknown>(appID?: string) => {
  return createModule((appID) => {
    const WORKER_MODULE = workerModule(appID);

    const ALL_SESSIONS = new Observable<AllSessions>({});
    const ACTIVE_SESSION = new Observable<ActiveSession | undefined>(undefined);

    const SESSION_MODULE = {
      clearSession(callback?: () => unknown) {
        return clearSession(WORKER_MODULE, ALL_SESSIONS, ACTIVE_SESSION, callback);
      },

      create: constructCreateSession<T>(WORKER_MODULE, ACTIVE_SESSION, ALL_SESSIONS),

      getSessions(callback?: (sessions: Readonly<AllSessions>) => unknown): void {
        getSessions(ALL_SESSIONS, () => {
          callback && callback(ALL_SESSIONS.get());
        });
      },

      import: constructImportSession<T>(WORKER_MODULE, ACTIVE_SESSION, ALL_SESSIONS),
      load: constructLoadSession<T>(WORKER_MODULE, ACTIVE_SESSION, ALL_SESSIONS),

      // TODO: simply expose a readonly version of the observable

      /** @returns An unsubscribe function. */
      onActiveSessionChange(callback: ObservableCallback<ActiveSession | undefined>) {
        return ACTIVE_SESSION.subscribe(callback);
      },

      /** @returns An unsubscribe function. */
      onSessionsChange(callback: ObservableCallback<AllSessions>) {
        return ALL_SESSIONS.subscribe(callback);
      },
    };

    indexedDB && SESSION_MODULE.getSessions();

    return SESSION_MODULE;
  })(appID);
};
