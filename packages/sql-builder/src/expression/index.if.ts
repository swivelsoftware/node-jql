import { IColumn, IConditional, IExpression } from '../index.if'
import { IQuery } from '../select/index.if'

/**
 * [left] (NOT) BETWEEN [start] AND [end]
 */
export interface IBetweenExpression extends IConditional {
  left?: IExpression
  not?: boolean
  start?: IExpression
  end?: IExpression
}

/**
 * [left] (NOT) [operator] [right]
 */
export interface IBinaryExpression extends IConditional {
  left?: IExpression
  not?: boolean
  operator: string
  right?: IExpression
}

/**
 * WHEN [when] THEN [then]
 */
export interface ICase {
  when: IConditional
  then: IExpression
}

/**
 * CASE [...cases] ELSE [else]
 */
export interface ICaseExpression extends IExpression {
  cases: ICase[]
  else?: IExpression
}

/**
 * Column definition
 */
export interface IColumnDefExpression extends IExpression {
  column: IColumn
}

/**
 * Column expression
 */
export interface IColumnExpression extends IExpression {
  table?: string
  name: string
}

/**
 * Function expression
 */
export interface IFunctionExpression extends IExpression {
  name: string
  arguments?: IExpression[]
}

/**
 * Supported group operators
 */
export type GroupOperator = 'AND'|'OR'

/**
 * AND-OR expressions
 */
export interface IGroupExpression extends IConditional {
  operator: GroupOperator
  expressions: IConditional[]
}

/**
 * [left] [operator] [right]
 */
export interface IMathExpression extends IExpression {
  left?: IExpression
  operator: string
  right?: IExpression
}

/**
 * Query
 */
export interface IQueryExpression extends IExpression {
  query: IQuery
}

/**
 * (NOT) EXISTS [query]
 */
export interface IExistsExpression extends IConditional {
  not?: boolean
  query: IQueryExpression
}

/**
 * Unknown phrase
 */
export interface IUnknown extends IExpression {
}

/**
 * Constant value
 */
export interface IValue extends IExpression {
  value: any
}

/**
 * Variable
 */
export interface IVariable extends IExpression {
  name: string
}
