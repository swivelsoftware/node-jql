import squel = require('squel')
import { ConditionalExpression, IConditionalExpression } from '..'
import { IQuery, Query } from '../../query'

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
 * JQL class for `EXISTS {query}`
 */
export class ExistsExpression extends ConditionalExpression implements IExistsExpression {
  public readonly classname = ExistsExpression.name
  public $not?: boolean
  public query: Query

  /**
   * @param json [Partial<IExistsExpression>]
   */
  constructor(json: Partial<IExistsExpression>)

  /**
   * @param json [IQuery]
   * @param $not [boolean] optional
   */
  constructor(query: IQuery, $not?: boolean)

  constructor(...args: any[]) {
    super()

    // parse args
    let query: IQuery, $not = false
    if ('classname' in args[0] && !('$select' in args[0] || '$from' in args[0])) {
      const json = args[0] as IExistsExpression
      $not = json.$not || false
      query = json.query
    }
    else {
      query = args[0]
      $not = args[1]
    }

    // check args
    if (!query) throw new SyntaxError('Missing query')

    // set args
    this.query = new Query(query)
    this.$not = $not
  }

  // @override
  public validate(availableTables: string[]) {
    this.query.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `${this.$not ? 'NOT ' : ''}EXISTS ?`,
        this.query.toSquel(),
      )
  }

  // @override
  public toJson(): IExistsExpression {
    const result: IExistsExpression = {
      classname: this.classname,
      query: this.query.toJson(),
    }
    if (this.$not) result.$not = true
    return result
  }
}
