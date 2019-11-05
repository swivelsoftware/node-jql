import format from 'string-format'
import { ConditionalExpression } from '..'
import { parse, register } from '../../parse'
import { QueryExpression } from '../query'
import { IQueryExpression } from '../query/index.if'
import { IExistsExpression } from './index.if'

/**
 * {left} IN {right}
 */
export class ExistsExpression extends ConditionalExpression implements IExistsExpression {
  // @override
  public readonly classname = ExistsExpression.name

  // @override
  public $not = false

  // @override
  public query: QueryExpression

  constructor(json?: IExistsExpression) {
    super()

    if (json) {
      this
        .setNot(json.$not)
        .setQuery(json.query)
    }
  }

  /**
   * Set NOT flag
   * @param expr [IExpression]
   */
  public setNot(flag = true): ExistsExpression {
    this.$not = flag
    return this
  }

  /**
   * Set query
   * @param query [IQueryExpression]
   */
  public setQuery(query: IQueryExpression): ExistsExpression {
    this.query = parse(query)
    return this
  }

  // @override
  public toJson(): IExistsExpression {
    this.check()
    return {
      classname: this.classname,
      $not: this.$not,
      query: this.query.toJson(),
    }
  }

  // @override
  public toString(): string {
    this.check()
    return format(this.$not ? 'NOT EXISTS {0}' : 'EXISTS {0}', this.query.toString())
  }

  // @override
  protected check(): void {
    if (!this.query) throw new SyntaxError('Query is not defined')
  }
}

register(ExistsExpression)
