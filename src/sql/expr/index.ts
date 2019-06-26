import squel = require('squel')
import { ISql, Sql } from '../../sql'

/**
 * Raw JQL for expression
 */
export interface IExpression extends ISql {
  /**
   * The expresison class name
   */
  classname: string

  [key: string]: any
}

/**
 * Abstract expression class in JQL
 */
export abstract class Expression extends Sql implements IExpression {
  public readonly classname: string

  // @override
  get [Symbol.toStringTag]() {
    return this.classname
  }

  // @override
  public abstract toJson(): IExpression
}

/**
 * Raw JQL for expression that returns boolean
 */
export interface IConditionalExpression extends IExpression {}

/**
 * Abstract JQL class for expression that returns boolean
 */
export abstract class ConditionalExpression extends Expression implements IConditionalExpression {
  // @override
  public abstract toSquel(options?: any): squel.Expression

  // @override
  public abstract toJson(): IConditionalExpression
}
