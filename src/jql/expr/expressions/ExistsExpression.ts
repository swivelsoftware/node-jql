import squel from '@swivel-admin/squel'
import { ConditionalExpression } from '..'
import { IQuery } from '../../query/interface'
import { ICaseExpression, IExistsExpression, IQueryExpression } from '../interface'
import { parseExpr } from '../parse'
import { CaseExpression } from './CaseExpression'
import { QueryExpression } from './QueryExpression'

/**
 * JQL class for `EXISTS {query}`
 */
export class ExistsExpression extends ConditionalExpression implements IExistsExpression {
  public readonly classname = ExistsExpression.name
  public $not?: boolean
  public query: QueryExpression|CaseExpression

  /**
   * @param json [Partial<IExistsExpression>]
   */
  constructor(json: Partial<IExistsExpression>)

  /**
   * @param json [IQuery|IQueryExpression|ICaseExpression]
   * @param $not [boolean] optional
   */
  constructor(query: IQuery|IQueryExpression|ICaseExpression, $not?: boolean)

  constructor(...args: any[]) {
    super()

    // parse args
    let query: IQueryExpression|ICaseExpression, $not = false
    if (['Query', 'QueryExpression', 'CaseExpression'].indexOf(args[0].classname) === -1 && 'query' in args[0]) {
      const json = args[0] as IExistsExpression
      $not = json.$not || false
      query = json.query.classname === 'Query' ? new QueryExpression(json.query) : json.query as IQueryExpression|ICaseExpression
    }
    else {
      query = args[0].classname === 'Query' ? new QueryExpression(args[0]) : args[0] as IQueryExpression|ICaseExpression
      $not = args[1]
    }

    // check args
    if (!query) throw new SyntaxError('Missing query')

    // set args
    this.query = parseExpr(query)
    this.$not = $not
  }

  // @override
  public validate(availableTables: string[]): void {
    this.query.validate(availableTables)
  }

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.Expression {
    const squel_ = squel.useFlavour(type as any)
    return squel_.expr()
      .and(
        `${this.$not ? 'NOT ' : ''}EXISTS ?`,
        this.query.toSquel(type, options),
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
