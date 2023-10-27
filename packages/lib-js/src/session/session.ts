import { type Session as DBSession, getAll } from '../keys/worker/indexeddb.js';

export interface Session<T = unknown> extends Omit<DBSession<T>, 'id'> {
  id: number;
}

export function getSessions(): Promise<Session[]> {
  return getAll('session') as Promise<Session[]>;
}
