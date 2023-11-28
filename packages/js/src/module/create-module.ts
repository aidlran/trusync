const DEPENDENCIES = new Set();

export function createModule<T>(constructor: (appID: string) => T): (appID?: string) => T {
  const INSTANCES: Record<string, T> = {};
  return (appID = ''): T => {
    if (DEPENDENCIES.has(constructor)) {
      throw new Error('Circular dependency detected');
    }
    DEPENDENCIES.add(constructor);
    if (!INSTANCES[appID]) {
      INSTANCES[appID] = constructor(appID);
    }
    DEPENDENCIES.delete(constructor);
    return INSTANCES[appID];
  };
}
