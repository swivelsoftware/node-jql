import squel from 'squel'
import { Value } from '../expr/expressions/Value'
import { IValue } from '../expr/interface'
import { parseExpr } from '../expr/parse'
import { ILimitOffset, IQuery, QueryPartition } from './interface'

/**
 * JQL class defining selected columns in query
 */
export class LimitOffset extends QueryPartition implements ILimitOffset {
  public $limit: Value
  public $offset?: Value

  /**
   * @param json [IResultColumn]
   */
  constructor(json: ILimitOffset)

  /**
   * @param expression [expression]
   * @param $as [string] optional
   */
  constructor($limit: number|IValue, $offset?: number|IValue)

  constructor(...args: any[]) {
    super()

    // parse args
    let $limit: number|IValue, $offset: number|IValue|undefined
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
    if ($offset) this.$offset = parseExpr($offset) as Value
  }

  // @override
  public apply(type: squel.Flavour, query: IQuery, builder: squel.Select): squel.Select {
    builder = builder.limit(this.$limit.value)
    if (this.$offset) builder = builder.offset(this.$offset.value)
    return builder
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toJson(): ILimitOffset {
    const result: ILimitOffset = { $limit: this.$limit.toJson() }
    if (this.$offset) result.$offset = this.$offset.toJson()
    return result
  }
}
