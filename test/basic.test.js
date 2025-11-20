
describe('Basic Test Suite', () => {
  test('1 + 1 should equal 2', () => {
    expect(1 + 1).toBe(2);
  });

  test('string should contain substring', () => {
    expect('hello world').toContain('hello');
  });

  test('true should be truthy', () => {
    expect(true).toBeTruthy();
  });
});