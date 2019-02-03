import { SumFunction } from './sum'

test('Test SumFunction', () => {
  const function_ = new SumFunction()
  const result = function_.run(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
  expect(result).toBe(55)
})
