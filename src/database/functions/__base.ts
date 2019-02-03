import { Type } from '../metadata/column'

export class JQLFunction<T> {
  constructor(readonly type: Type, private readonly function_: (...args: any[]) => T) {
  }

  public run(...args: any[]): T {
    return this.function_(...args)
  }

  public runGroupBy(...args: T[]): T {
    return args[0]
  }

  public toString(): string {
    return this.function_.toString()
  }
}
