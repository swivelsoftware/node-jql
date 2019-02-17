import { Type } from '../schema'

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

  public toString(): string {
    return this.function_.toString()
  }
}
