import squel = require('squel')
import { IJql, Jql } from '..'
import { Expression, IExpression } from '../expr'
import { ColumnExpression } from '../expr/expressions/ColumnExpression'
import { parse } from '../expr/parse'

/**
 * Raw JQL defining selected columns in query
 */
export interface IResultColumn extends IJql {
  /**
   * Result column context
   */
  expression: IExpression

  /**
   * alias column name
   */
  $as?: string
}

/**
 * JQL class defining selected columns in query
 */
export class ResultColumn extends Jql implements IResultColumn {
  public expression: Expression
  public $as?: string

  /**
   * @param json [IResultColumn]
   */
  constructor(json: IResultColumn)

  /**
   * @param expression [expression|string]
   * @param $as [string] optional
   */
  constructor(expression: IExpression|string, $as?: string)

  constructor(...args: any[]) {
    super()

    // parse args
    let expression: IExpression, $as: string|undefined
    if (args.length === 1 && typeof args[0] === 'object' && !('classname' in args[0])) {
      const json = args[0] as IResultColumn
      expression = json.expression
      $as = json.$as
    }
    else {
      expression = typeof args[0] === 'string' ? new ColumnExpression(args[0]) : args[0]
      $as = args[1]
    }

    // set args
    this.expression = parse(expression)
    this.$as = $as
  }

  // @override
  get [Symbol.toStringTag]() {
    return ResultColumn.name
  }

  // @override
  public validate(availableTables: string[]) {
    this.expression.validate(availableTables)
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    const builder = squel.select({}, [new squel.cls.GetFieldBlock()]) as squel.Select
    return builder.field(this.expression.toSquel(), this.$as)
  }

  // @override
  public toJson(): IResultColumn {
    const result: IResultColumn = { expression: this.expression.toJson() }
    if (this.$as) result.$as = this.$as
    return result
  }
}
