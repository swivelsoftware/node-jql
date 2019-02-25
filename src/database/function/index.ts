import { JQLFunction } from './interface'
import { SumFunction } from './numeric/sum'
import { ConcatFunction } from './string/concat'

export const functions: { [key in string]: JQLFunction } = {
  // numeric functions
  sum: new SumFunction(),

  // string functions
  concat: new ConcatFunction(),
}
