import { createFunction } from './createFunction'

test('Create Function from String', () => {
  function test(a: number, b: number): number {
    return a + b
  }

  const test_ = createFunction(test.toString())

  // 1) is a function
  expect(typeof test_).toBe('function')

  // 2) same result
  expect(test(1, 1)).toBe(test_(1, 1))
})
