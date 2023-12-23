import type { Session as DBSession } from '../indexeddb/indexeddb.js';
import type { Observable } from '../observable/observable.js';

export interface Session<T = unknown>
  extends Omit<DBSession<T>, 'id' | 'salt' | 'nonce' | 'payload'> {
  id: number;
  active: boolean;
}

export interface ActiveSession<T = unknown> extends Session<T> {
  active: true;
}

export interface InactiveSession<T = unknown> extends Session<T> {
  active: false;
}

export type AllSessions<T = unknown> = Partial<Record<number, Session<T>>>;

export type ActiveSessionObservable<T = unknown> = Observable<ActiveSession<T> | undefined>;

export type AllSessionsObservable<T = unknown> = Observable<AllSessions<T>>;
