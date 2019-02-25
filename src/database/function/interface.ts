import { Type } from '../schema/interface'

export class JQLFunction<T = any> {
  public readonly allowNoArg = false

  constructor(readonly type: Type, private readonly function_: (...args: any[]) => T) {
  }

  public run(...args: any[]): T {
    return this.function_.apply(this, args)
  }

  public group(...args: T[]): T {
    return args[0]
  }

  // @override
  public toString(): string {
    return this.function_.toString()
  }
}
