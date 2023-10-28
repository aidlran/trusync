const { instanceResourceMap } = require('./instance-resource-map');

describe('instance resource map', () => {
  it('constructs with given constructors', () => {
    const constructors = [Array, Set, Object];
    for (const constructor of constructors) {
      const map = instanceResourceMap(constructor);
      expect(map('key')).toBeInstanceOf(constructor);
    }
  });

  it('key maps to the same thing', () => {
    const KEY = 'a key';
    const map = instanceResourceMap(Array);
    const value = map(KEY);
    const item = { a: 'a' };
    value.item = item;
    expect(map(KEY)).toBe(value);
    expect(map(KEY).item).toBe(item);
  });
});
