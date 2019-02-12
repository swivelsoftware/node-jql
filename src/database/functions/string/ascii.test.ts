import { AsciiFunction } from './ascii'
import { ConcatFunction } from './concat'

test('Test AsciiFunction', () => {
  const function_ = new AsciiFunction()
  const result = function_.run('A')
  expect(result).toBe(65)
})
