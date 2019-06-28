import squel = require('squel')
import { IJql, Jql } from '../../jql'
import { IParseable } from '../parse'

/**
 * Raw JQL for expression
 */
export interface IExpression extends IJql, IParseable {
}

/**
 * Abstract expression class in JQL
 */
export abstract class Expression extends Jql implements IExpression {
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
