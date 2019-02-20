import { Type } from '../schema/interface'

export class JQLFunction<T = any> {
  constructor(readonly type: Type, private readonly function_: (...args: any[]) => T) {
  }

  // aggregate values
  public run(...args: any[]): T {
    return this.function_(...args)
  }

  // aggregate the results from run()
  public runGroupBy(...args: T[]): T {
    return args[0]
  }

  // @override
  public toString(): string {
    return this.function_.toString()
  }
}

// import here to resolve circular dependencies
const { AsciiFunction } = require('./string/ascii') as typeof import('./string/ascii')
const { ConcatFunction } = require('./string/concat') as typeof import('./string/concat')
const { SumFunction } = require('./numeric/sum') as typeof import('./numeric/sum')

export const functions: { [key in string]: JQLFunction } = {
  // string functions
  ascii: new AsciiFunction(),
  concat: new ConcatFunction(),

  // numeric functions
  sum: new SumFunction(),
}
