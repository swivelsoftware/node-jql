import { JQL } from '..'
import { ConditionalExpression } from '../expressions'
import { IConditionalExpression } from '../expressions/index.if'
import { parse } from '../parse'
import { ISchemaTable } from '../select/fromTable/index.if'
import { SchemaTable } from '../select/fromTable/table'
import { IDeleteJQL } from './index.if'

/**
 * DELETE FROM ...
 */
export class DeleteJQL extends JQL implements IDeleteJQL {
  // @override
  public readonly classname = DeleteJQL.name

  // @override
  public $from: SchemaTable

  // @override
  public $where?: ConditionalExpression

  constructor(json?: string|IDeleteJQL) {
    super()

    if (typeof json === 'string') {
      this.from(new SchemaTable(json))
    }
    else if (json) {
      this.from(json.$from)
      if (json.$where) this.where(json.$where)
    }
  }

  /**
   * Set table source
   * @param table [ISchemaTable]
   */
  public from(table: ISchemaTable): DeleteJQL {
    this.$from = new SchemaTable(table)
    return this
  }

  /**
   * Set WHERE clause
   * @param expression [IConditionalExpression]
   */
  public where(expression: IConditionalExpression): DeleteJQL {
    this.$where = parse(expression)
    return this
  }

  // @override
  public toJson(): IDeleteJQL {
    this.check()
    const result = {
      classname: this.classname,
      $from: this.$from.toJson(),
    } as IDeleteJQL
    if (this.$where) result.$where = this.$where.toJson()
    return result
  }

  // @override
  public toString(): string {
    this.check()
    let result = `DELETE FROM ${this.$from.toString()}`
    if (this.$where) result += ` WHERE ${this.$where.toString()}`
    return result
  }

  // @override
  protected check(): void {
    if (!this.$from) throw new SyntaxError('Table is not defined')
  }
}
