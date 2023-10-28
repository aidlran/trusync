const { calculateClusterSize } = require('./worker-defaults');

describe('calculateClustersize', () => {
  it('provides default', () => {
    expect(typeof calculateClusterSize()).toBe('number');
  });

  it('works if hardwareConcurrency undefined', () => {
    jest.spyOn(navigator as any, 'hardwareConcurrency', 'get').mockReturnValue(undefined);
    expect(typeof calculateClusterSize()).toBe('number');
  });

  it('respects ceiling', () => {
    jest.spyOn(navigator, 'hardwareConcurrency', 'get').mockReturnValue(4);
    expect(calculateClusterSize(3)).toBe(3);
  });

  it('respects floor', () => {
    jest.spyOn(navigator, 'hardwareConcurrency', 'get').mockReturnValue(4);
    expect(calculateClusterSize(8, 16)).toBe(8);
  });
});
