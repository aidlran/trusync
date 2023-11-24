import { CircularDependencyError } from './circular-dependency-error.js';

const DEPENDENCY_SET = new Set<string>();

export function moduleProvider<T>(
  id: string,
  constructor: (key: string) => T,
): (key?: string) => T {
  const INSTANCES: Record<string, T> = {};
  return function (key = ''): T {
    if (DEPENDENCY_SET.has(id)) {
      throw new CircularDependencyError(id, DEPENDENCY_SET);
    }
    DEPENDENCY_SET.add(id);
    const module = (INSTANCES[key] ??= constructor(key));
    DEPENDENCY_SET.delete(id);
    return module;
  };
}
