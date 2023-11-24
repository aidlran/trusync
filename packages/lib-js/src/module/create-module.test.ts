import { describe, expect, it, test } from 'vitest';
import { createModule } from './create-module.js';
import { CircularDependencyError } from './circular-dependency-error.js';

describe('create module', () => {
  it('creates', () => {
    test('with set constructor', () => {
      const getModule = createModule('set constructor', () => new Set());
      expect(getModule).toBeTypeOf('function');
      expect(getModule()).toBeInstanceOf(Set);
    });

    test('with array literal', () => {
      const getModule = createModule('array literal', () => []);
      expect(getModule).toBeTypeOf('function');
      expect(getModule()).toBeInstanceOf(Array);
    });
  });

  it('tracks instances', () => {
    const getModule = createModule('array', () => new Array<string>());
    const instanceDefault = getModule();
    const instanceA = getModule('app A');
    const instanceB = getModule('app B');
    expect(getModule()).toBe(instanceDefault);
    expect(getModule('app A')).toBe(instanceA);
    expect(getModule('app B')).toBe(instanceB);
  });

  it('allows stacked calls', () => {
    const getModuleA = createModule('a', () => []);
    const getModuleB = createModule('b', (key) => {
      getModuleA(key);
      return [];
    });
    expect(getModuleB()).toBeInstanceOf(Array);
  });

  it('detects and throws circular dependencies', () => {
    let getModuleA;
    const getModuleB = createModule('b', (key) => {
      getModuleA(key);
      return [];
    });
    getModuleA = createModule('a', (key) => {
      getModuleB(key);
      return [];
    });
    expect(() => getModuleA()).toThrowError(CircularDependencyError);
    expect(() => getModuleB()).toThrowError(CircularDependencyError);
  });
});
