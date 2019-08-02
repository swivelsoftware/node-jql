import squel from 'squel'
import { JQL } from '..'
import { Expression } from '../expr'
import { IExpression } from '../expr/interface'
import { parseExpr } from '../expr/parse'
import { ILimitOffset } from './interface'

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
    this.$limit = parseExpr($limit)
    if ($offset) this.$offset = parseExpr($offset)
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
