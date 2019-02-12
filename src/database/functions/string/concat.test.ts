import { ConcatFunction } from './concat'

test('Test ConcatFunction', () => {
  const function_ = new ConcatFunction()
  const result = function_.run('Hello', ', ', 'World', '!')
  expect(result).toBe('Hello, World!')
})
