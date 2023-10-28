const { instanceResourceMap } = require('./instance-resource-map');

describe('instance resource map', () => {
  it('constructs with given constructors', () => {
    const constructors = [Array, Set, Object];
    for (const constructor of constructors) {
      const map = instanceResourceMap(constructor);
      expect(map('key')).toBeInstanceOf(constructor);
    }
  });

  it('tracks objects', () => {
    const map = instanceResourceMap(Array);
    const entryDefault = map();
    const entry1 = map('1');
    const entry2 = map('2');
    expect(map()).toBe(entryDefault);
    expect(map('1')).toBe(entry1);
    expect(map('2')).toBe(entry2);
  });
});
