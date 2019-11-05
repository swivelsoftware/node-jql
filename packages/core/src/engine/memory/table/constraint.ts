import { JQL } from '../../../jql'
import { register } from '../../../jql/parse'
import { ITableConstraint, ITablePrimaryKeyConstraint, ITableRawConstraint } from './index.if'

/**
 * Extra options for creating table
 */
export abstract class TableConstraint extends JQL implements ITableConstraint {
}

/**
 * Raw constraint
 */
export class TableRawConstraint extends TableConstraint implements ITableRawConstraint {
  // @override
  public readonly classname = TableRawConstraint.name

  // @override
  public value: string

  constructor(json?: string|ITableRawConstraint) {
    super()

    if (typeof json === 'string') {
      this.set(json)
    }
    else if (json) {
      this.set(json.value)
    }
  }

  /**
   * Set value
   * @param value [string]
   */
  public set(value: string): TableRawConstraint {
    this.value = value
    return this
  }

  // @override
  public toJson(): ITableRawConstraint {
    this.check()
    return {
      classname: this.classname,
      value: this.value,
    }
  }

  // @override
  public toString(): string {
    this.check()
    return this.value
  }

  // @override
  protected check(): void {
    if (!this.value) throw new SyntaxError('Raw constraint is not defined')
  }
}

/**
 * PRIMARY KEY constraint
 */
export class TablePrimaryKeyConstraint extends TableConstraint implements ITablePrimaryKeyConstraint {
  // @override
  public readonly classname = TablePrimaryKeyConstraint.name

  // @override
  public columns: string[] = []

  constructor(json?: string|ITablePrimaryKeyConstraint) {
    super()

    if (typeof json === 'string') {
      this.addColumn(json)
    }
    else if (json) {
      for (const c of json.columns) this.addColumn(c)
    }
  }

  /**
   * Add primary column
   * @param name [string]
   */
  public addColumn(name: string): TablePrimaryKeyConstraint {
    this.columns.push(name)
    return this
  }

  // @override
  public toJson(): ITablePrimaryKeyConstraint {
    this.check()
    return {
      classname: this.classname,
      columns: this.columns.map(c => c),
    }
  }

  // @override
  public toString(): string {
    this.check()
    return `PRIMARY KEY(${this.columns.map(c => `\`${c}\``).join(', ')})`
  }

  // @override
  protected check(): void {
    if (!this.columns.length) throw new SyntaxError('No primary key column is defined')
  }
}

register(TableRawConstraint)
register(TablePrimaryKeyConstraint)
