import { beforeEach, describe, expect, it, test } from 'vitest';
import { Observable } from '../../observable/observable.js';
import type { PostToOneAction } from '../../worker/types/action.js';
import type { Request } from '../../worker/types/request.js';
import type { Result } from '../../worker/types/result.js';
import type { JobCallback } from '../../worker/worker-instance.js';
import type { AllSessionsObservable } from '../types.js';
import { construct } from './import.js';
import type { SessionLoadFn } from './load.js';

const postToOne = <T extends PostToOneAction>(request: Request<T>, callback?: JobCallback<T>) => {
  if (request.action !== 'session.import') {
    throw new Error('Unexpected request action');
  }
  if (callback) {
    callback({
      action: 'session.import',
      ok: true,
      payload: { id: 1 },
    } as Result<T>);
  }
};
const load: SessionLoadFn = (id, _passphrase, callback) => {
  if (callback) callback({ id });
};
load.asPromise = (id, passphrase) => {
  return new Promise((resolve) => load(id, passphrase, resolve));
};
const allSessions: AllSessionsObservable = new Observable({});
const fn = construct({ postToOne }, load, allSessions);

it("doesn't use an unexpected request action", () => {
  expect(() => fn({ mnemonic: 'mnemonic sentence', passphrase: 'passphrase' })).not.toThrow();
});

describe('add created session to all sessions observable', () => {
  const checkResult = () => {
    expect(allSessions.get()[1]).property('active').equals(false);
  };

  beforeEach(() => {
    allSessions.update(() => ({}));
  });

  test('callback', () => {
    fn({ mnemonic: 'mnemonic sentence', passphrase: 'passphrase' }, checkResult);
  });

  test('asPromise', () => {
    expect(fn.asPromise({ mnemonic: 'mnemonic sentence', passphrase: 'passphrase' })).resolves;
    checkResult();
  });
});
