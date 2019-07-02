import squel = require('squel')
import { IJQL, JQL } from '../../jql'
import { IParseable } from '../parse'

/**
 * Raw JQL for expression
 */
export interface IExpression extends IJQL, IParseable {
}

/**
 * Abstract expression class in JQL
 */
export abstract class Expression extends JQL implements IExpression {
  public readonly classname: string

  // @override
  get [Symbol.toStringTag](): string {
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
