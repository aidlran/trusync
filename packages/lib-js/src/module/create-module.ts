import { CircularDependencyError } from './circular-dependency-error.js';

const DEPENDENCY_SET = new Set<string>();

export function createModule<T>(
  moduleID: string,
  constructor: (appID: string) => T,
): (appID?: string) => T {
  const INSTANCES: Record<string, T> = {};
  return function (appID = ''): T {
    if (DEPENDENCY_SET.has(moduleID)) {
      throw new CircularDependencyError(moduleID, DEPENDENCY_SET);
    }
    DEPENDENCY_SET.add(moduleID);
    const module = (INSTANCES[appID] ??= constructor(appID));
    DEPENDENCY_SET.delete(moduleID);
    return module;
  };
}
