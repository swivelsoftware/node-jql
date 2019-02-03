import { JQLFunction } from './__base'
import { SumFunction } from './numeric/sum'
import { ConcatFunction } from './string/concat'

export const functions: { [key: string]: JQLFunction<any> } = {
  // string functions
  concat: new ConcatFunction(),

  // numeric functions
  sum: new SumFunction(),
}
