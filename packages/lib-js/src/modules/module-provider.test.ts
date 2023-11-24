import { describe, expect, it, test } from 'vitest';
import { moduleProvider } from './module-provider.js';
import { CircularDependencyError } from './circular-dependency-error.js';

describe('module provider', () => {
  it('creates', () => {
    test('with set constructor', () => {
      const provide = moduleProvider('set constructor', () => new Set());
      expect(provide).toBeTypeOf('function');
      expect(provide()).toBeInstanceOf(Set);
    });

    test('with array literal', () => {
      const provide = moduleProvider('array literal', () => []);
      expect(provide).toBeTypeOf('function');
      expect(provide()).toBeInstanceOf(Array);
    });
  });

  it('tracks objects', () => {
    const provide = moduleProvider('array', () => new Array<string>());
    const entryDefault = provide();
    const entry1 = provide('1');
    const entry2 = provide('2');
    expect(provide()).toBe(entryDefault);
    expect(provide('1')).toBe(entry1);
    expect(provide('2')).toBe(entry2);
  });

  it('allows stacked calls', () => {
    const provideModuleA = moduleProvider('a', () => []);
    const provideModuleB = moduleProvider('b', (key) => {
      provideModuleA(key);
      return [];
    });
    expect(provideModuleB()).toBeInstanceOf(Array);
  });

  it('detects and throws circular dependencies', () => {
    let provideModuleA;
    const provideModuleB = moduleProvider('b', (key) => {
      provideModuleA(key);
      return [];
    });
    provideModuleA = moduleProvider('a', (key) => {
      provideModuleB(key);
      return [];
    });
    expect(() => provideModuleA()).toThrowError(CircularDependencyError);
    expect(() => provideModuleB()).toThrowError(CircularDependencyError);
  });
});
