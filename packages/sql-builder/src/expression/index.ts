import { IExpression, IStringify } from '../index.if'

/**
 * Base expression class
 */
export abstract class Expression implements IExpression, IStringify {
  // @override
  public readonly classname: string

  // @override
  public abstract toString(): string

  // @override
  public abstract toJson(): IExpression
}
