import { JQL } from '../..'
import { ILimitBy } from './index.if'

/**
 * Pagination
 */
export class LimitBy extends JQL implements ILimitBy {
  // @override
  public readonly classname = LimitBy.name

  // @override
  public $limit = Number.MAX_SAFE_INTEGER

  // @override
  public $offset = 0

  constructor(json?: ILimitBy) {
    super()

    if (json) {
      this.setLimit(json.$limit)
      this.setOffset(json.$offset)
    }
  }

  /**
   * set number of records
   * @param limit [number]
   */
  public setLimit(limit: number): LimitBy {
    this.$limit = limit
    return this
  }

  /**
   * set record offset
   * @param offset [number]
   */
  public setOffset(offset = 0): LimitBy {
    this.$offset = offset
    return this
  }

  // @override
  public toJson(): ILimitBy {
    return {
      classname: this.classname,
      $limit: this.$limit,
      $offset: this.$offset,
    }
  }
}
