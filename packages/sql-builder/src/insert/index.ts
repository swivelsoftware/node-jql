import { stringify } from '../dbType/stringify'
import { IStringify } from '../index.if'
import { register } from '../parse'
import { Query } from '../select'
import { IInsert, IInsertSelect } from './index.if'

/**
 * INSERT INTO
 */
export class Insert implements IInsert, IStringify {
  public readonly classname: string = Insert.name
  public readonly database?: string
  public readonly name: string
  public readonly columns: string[] = []
  public readonly values: any[]

  constructor(json: IInsert) {
    this.database = json.database
    this.name = json.name
    if (json.columns) this.columns = json.columns
    this.values = Array.isArray(json.values) ? json.values : [json.values]

    if (!this.columns && !Array.isArray(this.values[0])) {
      throw new SyntaxError('You must provide a 2D array as values in case you have not specified the order of columns')
    }
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IInsert {
    const json: IInsert = {
      classname: this.classname,
      name: this.name,
      values: this.values,
    }
    if (this.database) json.database = this.database
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
