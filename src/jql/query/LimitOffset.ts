import squel from 'squel'
import { IJQL, JQL } from '..'
import { Expression, IExpression } from '../expr'
import { parse } from '../expr/parse'

/**
 * Raw JQL for `LIMIT {$limit} OFFSET {$offset}`
 */
export interface ILimitOffset extends IJQL {
  /**
   * Limit result count
   */
  $limit: number|IExpression

  /**
   * Result start from ...
   */
  $offset?: number|IExpression
}

/**
 * JQL class defining selected columns in query
 */
export class LimitOffset extends JQL implements ILimitOffset {
  public $limit: Expression
  public $offset?: Expression

  /**
   * @param json [IResultColumn]
   */
  constructor(json: ILimitOffset)

  /**
   * @param expression [expression]
   * @param $as [string] optional
   */
  constructor($limit: number|IExpression, $offset?: number|IExpression)

  constructor(...args: any[]) {
    super()

    // parse args
    let $limit: number|IExpression, $offset: number|IExpression|undefined
    if (typeof args[0] !== 'number' && !('classname' in args[0])) {
      const json = args[0] as ILimitOffset
      $limit = json.$limit
      $offset = json.$offset
    }
    else {
      $limit = args[0]
      $offset = args[1]
    }

    // set args
    this.$limit = parse($limit)
    if ($offset) this.$offset = parse($offset)
  }

  // @override
  get [Symbol.toStringTag](): string {
    return LimitOffset.name
  }

  // @override
  public validate(availableTables: string[]): void {
    this.$limit.validate(availableTables)
    if (this.$offset) this.$offset.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    let limitBuilder = squel.select({}, [new squel.cls.GetFieldBlock()]) as squel.Select
    limitBuilder = limitBuilder.field(this.$limit.toSquel())
    if (!this.$offset) return squel.rstr(`LIMIT ?`, limitBuilder)
    let offsetBuilder = squel.select({}, [new squel.cls.GetFieldBlock()]) as squel.Select
    offsetBuilder = offsetBuilder.field(this.$offset.toSquel())
    return squel.rstr(`LIMIT ? OFFSET ?`, limitBuilder, offsetBuilder)
  }

  // @override
  public toJson(): ILimitOffset {
    const result: ILimitOffset = { $limit: this.$limit.toJson() }
    if (this.$offset) result.$offset = this.$offset.toJson()
    return result
  }
}
