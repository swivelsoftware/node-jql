import { Type } from '../../Type'
import { IJQL, IParseable } from '../interface'
import { IQuery } from '../query/interface'
import { BinaryExpression } from './expressions/BinaryExpression'

/**
 * Raw JQL for expression
 */
export interface IExpression extends IJQL, IParseable {
}

/**
 * Raw JQL for expression that returns boolean
 */
export interface IConditionalExpression extends IExpression {}

/**
 * Raw JQL for conditional expressions
 */
export interface IGroupedExpressions extends IConditionalExpression {
  /**
   * Linked expressions
   */
  expressions: IConditionalExpression[]
}

/**
 * Raw JQL for `{left} BETWEEN {start} AND {end}`
 */
export interface IBetweenExpression extends IConditionalExpression {
  /**
   * Left expression
   */
  left: any

  /**
   * Whether `NOT BETWEEN` or `BETWEEN`
   */
  $not?: boolean

  /**
   * Start expression
   */
  start?: any

  /**
   * End expression
   */
  end?: any
}

/**
 * Binary operator
 */
export type BinaryOperator = '='|'<>'|'<'|'<='|'>'|'>='|'IN'|'IS'|'LIKE'|'REGEXP'

/**
 * Raw JQL for `{left} {operator} {right}`
 */
export interface IBinaryExpression extends IConditionalExpression {
  /**
   * Left expression
   */
  left: any

  /**
   * Whether `NOT` is added before operator
   */
  $not?: boolean

  /**
   * The operator used
   */
  operator: BinaryOperator

  /**
   * Right expression
   */
  right?: any
}

/**
 * Raw JQL for `WHEN {$when} THEN {$then}`
 */
export interface ICase extends IJQL {
  /**
   * Condition check
   */
  $when: IConditionalExpression

  /**
   * If condition matched
   */
  $then: any
}

/**
 * Raw JQL for `CASE {cases} ELSE {$else}`
 */
export interface ICaseExpression extends IExpression {
  /**
   * cases
   */
  cases: ICase[]|ICase

  /**
   * When no case matched
   */
  $else?: IExpression
}

/**
 * Raw JQL defining column expression
 */
export interface IColumnExpression extends IExpression {
  /**
   * Table name related to the column
   */
  table?: string

  /**
   * Column name
   */
  name: string
}

/**
 * Raw JQL for `EXISTS {query}`
 */
export interface IExistsExpression extends IConditionalExpression {
  /**
   * Whether `NOT EXISTS` or `EXISTS`
   */
  $not?: boolean

  /**
   * Sub-query for checking
   */
  query: IQuery
}

/**
 * Raw JQL defining function expression
 */
export interface IFunctionExpression extends IExpression {
  /**
   * Function name
   */
  name: string

  /**
   * Parameters
   */
  parameters?: any[]|any
}

/**
 * Raw JQL for `{left} IN {right}`
 */
export interface IInExpression extends IBinaryExpression {
  right?: IUnknown|IValue|any[]|IQuery
}

/**
 * Raw JQL for `{left} IS NULL`
 */
export interface IIsNullExpression extends IBinaryExpression {
  right?: null|undefined
}

/**
 * Raw JQL for `{left} LIKE {right}`
 */
export interface ILikeExpression extends IBinaryExpression {
  right?: IUnknown|string
}

/**
 * Raw JQL for `{left} REGEXP {right}`
 */
export interface IRegexpExpression extends IBinaryExpression {
  right?: IUnknown|RegExp|string
}

/**
 * Mathematical operator
 */
export type MathOperator = '+'|'-'|'*'|'/'|'%'|'MOD'|'DIV'

/**
 * Raw JQL defining mathematical expression
 */
export interface IMathExpression extends IExpression {
  /**
   * Left expression
   */
  left: any

  /**
   * The operator used
   */
  operator: MathOperator

  /**
   * Right expression
   */
  right?: any
}

/**
 * Raw JQL defining parameters for function expression
 */
export interface IParameterExpression extends IExpression {
  /**
   * Parameter prefix
   */
  prefix?: string

  /**
   * Parameter context
   */
  expression: any

  /**
   * Parameter suffix
   */
  suffix?: string
}

/**
 * Raw JQL for unknowns
 */
export interface IUnknown extends IExpression {
  /**
   * Available type for the unknown
   */
  type?: Type[]|Type
}

/**
 * Raw JQL for constants
 */
export interface IValue extends IUnknown {
  /**
   * Value assigned
   */
  value: any
}
