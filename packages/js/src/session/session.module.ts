import { createModule } from '../module/create-module.js';
import { Observable, type ObservableCallback } from '../observable/observable.js';
import { workerModule } from '../worker/worker.module.js';
import * as Functions from './function/index.js';
import type { ActiveSession, Sessions } from './types.js';

export const sessionModule = createModule((appID) => {
  const WORKER_MODULE = workerModule(appID);

  const ALL_SESSIONS = new Observable<Sessions>({});
  const ACTIVE_SESSION = new Observable<ActiveSession | undefined>(undefined);

  const SESSION_MODULE = {
    clearSession(callback?: () => unknown) {
      return Functions.clearSession(WORKER_MODULE, ALL_SESSIONS, ACTIVE_SESSION, callback);
    },

    forgetIdentity(address: string, callback?: () => unknown) {
      return Functions.forgetIdentity(
        WORKER_MODULE,
        ALL_SESSIONS,
        ACTIVE_SESSION,
        address,
        callback,
      );
    },

    getSessions(callback?: (sessions: Readonly<Sessions>) => unknown): void {
      Functions.getSessions(ALL_SESSIONS, () => {
        callback && callback(ALL_SESSIONS.get());
      });
    },

    importIdentity(
      address: string,
      secret: Uint8Array,
      callback?: Functions.ImportIdentityCallback,
    ) {
      return Functions.importIdentity(
        WORKER_MODULE,
        ALL_SESSIONS,
        ACTIVE_SESSION,
        SESSION_MODULE.forgetIdentity.bind(this),
        address,
        secret,
        callback,
      );
    },

    initSession(pin: string, metadata?: unknown, callback?: Functions.UseSessionCallback) {
      return Functions.initSession(
        WORKER_MODULE,
        SESSION_MODULE.useSession.bind(this),
        pin,
        metadata,
        callback,
      );
    },

    /** @returns An unsubscribe function. */
    onActiveSessionChange(callback: ObservableCallback<ActiveSession | undefined>) {
      return ACTIVE_SESSION.subscribe(callback);
    },

    /** @returns An unsubscribe function. */
    onSessionsChange(callback: ObservableCallback<Sessions>) {
      return ALL_SESSIONS.subscribe(callback);
    },

    useSession(sessionID: number, pin: string, callback?: Functions.UseSessionCallback) {
      return Functions.useSession(
        WORKER_MODULE,
        ALL_SESSIONS,
        ACTIVE_SESSION,
        SESSION_MODULE.clearSession.bind(this),
        sessionID,
        pin,
        callback,
      );
    },
  };

  indexedDB && SESSION_MODULE.getSessions();

  return SESSION_MODULE;
});
