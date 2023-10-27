export function instanceResourceMap<T>(constructor: new () => T): (key?: string) => T {
  const RESOURCE_MAP: Record<string, T> = {};
  return function (key = ''): T {
    return RESOURCE_MAP[key] ?? (RESOURCE_MAP[key] = new constructor());
  };
}
