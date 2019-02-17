import { JQLFunction } from './base'
import { SumFunction } from './numeric'
import { AsciiFunction, ConcatFunction } from './string'

export const predefinedFunctions: { [key in string]: JQLFunction } = {
  // string functions
  ascii: new AsciiFunction(),
  concat: new ConcatFunction(),

  // numeric functions
  sum: new SumFunction(),
}
