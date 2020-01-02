import { stringify } from '../dbType/stringify'
import { IExpression, IStringify } from '../index.if'

/**
 * Base expression class
 */
export abstract class Expression implements IExpression, IStringify {
  // @override
  public readonly classname: string

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public abstract toJson(): IExpression
}
