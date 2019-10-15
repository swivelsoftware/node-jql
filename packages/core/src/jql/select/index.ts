import format from 'string-format'
import { JQL } from '..'
import { ColumnExpression } from '../expressions/column'
import { QueryExpression } from '../expressions/query'
import { FromTable } from './fromTable'
import { IQuery } from './index.if'
import { ResultColumn } from './resultColumn'

/**
 * SELECT ... FROM ...
 */
export class Query extends JQL implements IQuery {
  // @override
  public readonly classname = Query.name

  // @override
  public $select: ResultColumn[] = []

  // @override
  public $from: FromTable[] = []

  constructor(json?: IQuery) {
    super()

    if (json) {
      // TODO
    }
  }

  // @override
  public toJson(): IQuery {
    this.check()
    return {
      classname: this.classname,
      $select: this.$select.map(r => r.toJson()),
      $from: this.$from.map(f => f.toJson()),
    }
  }

  // @override
  public toString(): string {
    this.check()
    let template = ''
    const args: string[] = []
    if (!this.$select.length) {
      template += 'SELECT *'
    }
    else {
      template += 'SELECT {}'
      args.push(this.$select.map(r => r.toString()).join(', '))
    }
    if (this.$from.length) {
      template += ' FROM {}'
      args.push(this.$from.map(f => f.toString()).join(', '))
    }
    return format(template, ...args)
  }

  /**
   * convert to Expression
   */
  public toExpression(): QueryExpression {
    this.check()
    return new QueryExpression(this)
  }

  protected check(): void {
    if (!this.$select.length && !this.$from.length) throw new SyntaxError('Missing data source. Please specify either $select or $from')
    if (this.hasWildcard() && !this.$from.length) throw new SyntaxError('Invalid use of wildcard column with no table specified')
    this.checkWildcard()
  }

  private hasWildcard(): boolean {
    for (const r of this.$select) {
      if (r.expression instanceof ColumnExpression && r.expression.name === '*') {
        return true
      }
    }
    return false
  }

  private checkWildcard(): void {
    for (const r of this.$select) {
      if (r.expression instanceof ColumnExpression && r.expression.name === '*' && r.$as) {
        throw new SyntaxError('Wildcard column cannot be renamed')
      }
    }
  }
}
