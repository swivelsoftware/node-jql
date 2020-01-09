import { Column as Column_, CreateTable, PrimaryKeyConstraint } from '@node-jql/sql-builder'
import { getDefaultValue } from '.'
import { CreateTableJQL } from './jql/create/table'

/**
 * Column definition
 */
export class Column extends Column_ {
  /**
   * Whether the column is primary key
   */
  get isPrimaryKey(): boolean {
    return !!this.options.find(o => o.toLocaleUpperCase() === 'PRIMARY KEY')
  }

  /**
   * Whether the column is auto-incremented
   */
  get isAutoIncrement(): boolean {
    const value = !!this.options.find(o => o.toLocaleUpperCase() === 'AUTO_INCREMENT')
    if (value && this.type.toString() !== 'number') throw new SyntaxError(`Column type '${this.type.toString()}' does not support AUTO_INCREMENT`)
    return value
  }

  /**
   * Whether the column is not nullable
   */
  get notNull(): boolean {
    return !!this.options.find(o => o.toLocaleUpperCase() === 'NOT NULL')
  }

  /**
   * Default value of the column
   */
  get defaultValue(): any {
    const option = this.options.find(o => o.toLocaleUpperCase().startsWith('DEFAULT ') && o.length > 8)
    let value
    if (!option) {
      value = getDefaultValue(this.type)
    }
    else {
      const valueStr = option.split('\\s+')[1]
      value =  JSON.parse(valueStr)
    }
    if (this.notNull && value === null) throw new SyntaxError(`Column '${this.name}' is not nullable`)
    return value
  }
}

/**
 * Table definition
 */
export class Table extends CreateTable {
  public readonly schema: string
  public readonly columns: Column[]

  constructor(jql: CreateTableJQL) {
    super(jql)
    this.schema = jql.schema
    this.columns = jql.columns.map(col => new Column(col))
    if (!this.primaryKeys.length) throw new SyntaxError(`Table '${this.name}' has no primary keys`)
  }

  /**
   * List primary keys
   */
  get primaryKeys(): string[] {
    const constraint = this.constraints.find(c => c instanceof PrimaryKeyConstraint)
    if (constraint && constraint instanceof PrimaryKeyConstraint) {
      return constraint.columns.map(c => c.name)
    }
    else {
      return this.columns.filter(c => c.isPrimaryKey).map(c => c.name)
    }
  }
}
