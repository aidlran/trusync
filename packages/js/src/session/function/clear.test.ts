import { beforeEach, describe, expect, it, test } from 'vitest';
import { Observable } from '../../observable/observable.js';
import type { PostToAllAction } from '../../worker/types/action.js';
import type { Request } from '../../worker/types/request.js';
import type { WorkerPostMultiResultCallback } from '../../worker/worker-dispatch.js';
import type { ActiveSession, ActiveSessionObservable, AllSessionsObservable } from '../types.js';
import { construct } from './clear.js';

const postToAll = <T extends PostToAllAction>(
  request: Request<T>,
  callback?: WorkerPostMultiResultCallback<T>,
) => {
  if (request.action !== 'session.clear') {
    throw new Error('Unexpected request action');
  }
  if (callback) {
    callback([]);
  }
};
const allSessions: AllSessionsObservable = new Observable({});
const activeSession = new Observable(undefined) as ActiveSessionObservable;
const fn = construct({ postToAll }, allSessions, activeSession);

it("doesn't use an unexpected request action", () => {
  expect(fn).not.toThrow();
});

describe('clears the active session', () => {
  const checkResult = () => {
    expect(allSessions.get()[1]).property('active').equals(false);
    expect(activeSession.get()).toBeUndefined();
  };

  beforeEach(() => {
    const session: ActiveSession = { id: 1, active: true };
    allSessions.update(() => ({ 1: session }));
    activeSession.update(() => session);
  });

  test('callback', () => {
    fn(checkResult);
  });

  test('asPromise', () => {
    expect(fn.asPromise()).resolves;
    checkResult();
  });
});
