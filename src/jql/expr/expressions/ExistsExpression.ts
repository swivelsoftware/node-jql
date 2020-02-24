import squel from 'squel'
import { ConditionalExpression } from '..'
import { Query } from '../../query'
import { IQuery } from '../../query/interface'
import { IExistsExpression } from '../interface'

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
    if (args[0].classname !== 'Query' && !('$select' in args[0] || '$from' in args[0])) {
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
  public validate(availableTables: string[]): void {
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