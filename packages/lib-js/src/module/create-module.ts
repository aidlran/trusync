const DEPENDENCY_SET = new Set<unknown>();

export function createModule<T>(constructor: (appID: string) => T): (appID?: string) => T {
  const INSTANCES: Record<string, T> = {};
  return (appID = ''): T => {
    if (DEPENDENCY_SET.has(constructor)) {
      throw new Error('Circular dependency detected');
    }
    DEPENDENCY_SET.add(constructor);
    const module = (INSTANCES[appID] ??= constructor(appID));
    DEPENDENCY_SET.delete(constructor);
    return module;
  };
}
