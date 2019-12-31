import { stringify } from '..'
import { IStringify } from '../index.if'
import { register } from '../parse'
import { FromTable, Query } from '../select'
import { IInsert, IInsertSelect } from './index.if'

/**
 * INSERT INTO
 */
export class Insert implements IInsert, IStringify {
  public readonly classname: string = Insert.name
  public readonly into: FromTable
  public readonly columns: string[] = []
  public readonly values: any[]

  constructor(json: IInsert) {
    this.into = new FromTable(json.into)
    if (json.columns) this.columns = json.columns
    this.values = Array.isArray(json.values) ? json.values : [json.values]

    if (!this.columns && !Array.isArray(this.values[0])) {
      throw new SyntaxError('You must provide a 2D array as values in case you have not specified the order of columns')
    }
  }

  // @override
  public toString(): string {
    let str = `INSERT INTO ${this.into.toString()}`
    if (this.columns.length) {
      str += `(${this.columns.map(c => `\`${c}\``).join(', ')})`
      str += ` VALUES ${this.values.map(row => `(${this.columns.map(c => stringify(row[c])).join(', ')})`).join(', ')}`
    }
    else {
      const values = this.values as any[][]
      str += ` VALUES ${values.map(row => `(${row.map(v => stringify(v)).join(', ')})`).join(', ')}`
    }
    return str
  }

  // @override
  public toJson(): IInsert {
    const json: IInsert = {
      classname: this.classname,
      into: this.into.toJson(),
      values: this.values,
    }
    if (this.columns.length) json.columns = this.columns
    return json
  }
}

/**
 * INSERT INTO SELECT
 */
export class InsertSelect extends Insert implements IInsertSelect {
  public readonly classname: string = InsertSelect.name
  public readonly query: Query

  constructor(json: IInsertSelect) {
    super(json)
    this.query = new Query(json)
  }

  // @override
  public toString(): string {
    let str = `INSERT INTO ${this.into.toString()}`
    if (this.columns.length) {
      str += `(${this.columns.map(c => `\`${c}\``).join(', ')})`
    }
    str += ` ${this.query.toString()}`
    return str
  }

  // @override
  public toJson(): IInsertSelect {
    return {
      ...super.toJson(),
      classname: this.classname,
      query: this.query.toJson(),
    }
  }
}

register(Insert)
register(InsertSelect)
