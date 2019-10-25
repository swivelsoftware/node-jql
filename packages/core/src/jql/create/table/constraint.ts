import { JQL } from '../..'
import { register } from '../../parse'
import { ICreateTableConstraint, ICreateTablePrimaryKeyConstraint, ICreateTableRawConstraint } from './index.if'

/**
 * extra options for create table
 */
export abstract class CreateTableConstraint extends JQL implements ICreateTableConstraint {
}

/**
 * raw constraint
 */
export class CreateTableRawConstraint extends CreateTableConstraint implements ICreateTableRawConstraint {
  // @override
  public readonly classname = CreateTableRawConstraint.name

  // @override
  public value: string

  constructor(json?: string|ICreateTableRawConstraint) {
    super()

    if (typeof json === 'string') {
      this.set(json)
    }
    else if (json) {
      this.set(json.value)
    }
  }

  /**
   * set value
   * @param value [string]
   */
  public set(value: string): CreateTableRawConstraint {
    this.value = value
    return this
  }

  // @override
  public toJson(): ICreateTableRawConstraint {
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
export class CreateTablePrimaryKeyConstraint extends CreateTableConstraint implements ICreateTablePrimaryKeyConstraint {
  // @override
  public readonly classname = CreateTablePrimaryKeyConstraint.name

  // @override
  public columns: string[] = []

  constructor(json?: string|ICreateTablePrimaryKeyConstraint) {
    super()

    if (typeof json === 'string') {
      this.addColumn(json)
    }
    else if (json) {
      for (const c of json.columns) this.addColumn(c)
    }
  }

  /**
   * add primary column
   * @param name [string]
   */
  public addColumn(name: string): CreateTablePrimaryKeyConstraint {
    this.columns.push(name)
    return this
  }

  // @override
  public toJson(): ICreateTablePrimaryKeyConstraint {
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

register(CreateTableRawConstraint)
register(CreateTablePrimaryKeyConstraint)
