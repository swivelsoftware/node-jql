import squel = require('squel')
import { Sql } from '../Sql'

export interface IExpression {
  classname?: string
  [key: string]: any
}

export abstract class Expression extends Sql implements IExpression {
  public readonly classname: string
}

export interface IConditionalExpression extends IExpression {
}

export abstract class ConditionalExpression extends Expression implements IConditionalExpression {
  // @override
  public abstract toSquel(): squel.Expression
}
