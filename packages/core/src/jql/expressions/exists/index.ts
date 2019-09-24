import format from 'string-format'
import { ConditionalExpression } from '..'
import { Query } from '../../select'
import { IQuery } from '../../select/index.if'
import { register } from '../parse'
import { IExistsExpression } from './index.if'

/**
 * {left} IN {right}
 */
export class ExistsExpression extends ConditionalExpression implements IExistsExpression {
  // @override
  public readonly classname: string = ExistsExpression.name

  // @override
  public $not: boolean

  // @override
  public query: Query

  constructor(json: IExistsExpression)
  constructor(query: Query)
  constructor($not: true, query: Query)
  constructor(...args: any[]) {
    super()

    // parse
    let $not: boolean = false, query: IQuery
    if ('classname' in args[0] && args[0].classname === 'ExistsExpression') {
      const json = args[0] as IExistsExpression
      $not = json.$not || false
      query = json.query
    }
    else if ('classname' in args[0] && args[0].classname === 'Query') {
      query = args[0] as IQuery
    }
    else {
      $not = args[0] as boolean
      query = args[1] as IQuery
    }

    // set
    this.$not = $not
    this.query = new Query(query)
  }

  // @override
  public toJson(): IExistsExpression {
    return {
      classname: this.classname,
      $not: this.$not,
      query: this.query.toJson(),
    }
  }

  // @override
  public toString(): string {
    return format(this.$not ? 'NOT EXISTS {0}' : 'EXISTS {0}', this.query.toString())
  }
}

register(ExistsExpression)
