import type { Session as DBSession } from '../indexeddb/indexeddb.js';
import type { Observable } from '../observable/observable.js';

type BaseSession<T = unknown> = Omit<DBSession<T>, 'id' | 'salt' | 'nonce' | 'payload'> & {
  id?: number;
  active: boolean;
  identities?: Set<string>;
  onChange?: (session: Session) => unknown;
};

export interface ActiveSession<T = unknown> extends BaseSession<T> {
  id?: number;
  active: true;
  identities: Set<string>;
}

export interface InactiveSession<T = unknown> extends BaseSession<T> {
  id: number;
  active: false;
}

export type Session<T = unknown> = ActiveSession<T> | InactiveSession<T>;

export type Sessions<T = unknown> = Partial<Record<number, Session<T>>>;

export type ActiveSessionObservable<T = unknown> = Observable<ActiveSession<T> | undefined>;

export type AllSessionsObservable = Observable<Sessions>;
