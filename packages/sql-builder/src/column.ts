import _ = require('lodash')
import { stringify } from './dbType/stringify'
import { IBuilder, IColumn, IStringify } from './index.if'

class Builder implements IBuilder<Column> {
  private json: IColumn

  constructor(name: string, type: string, ...typeArgs: any[]) {
    this.json = { name, type }
    if (typeArgs.length) this.json.typeArgs = typeArgs
  }

  /**
   * Add name-value option
   * @param name [string]
   * @param value [string]
   */
  public options(name: string, value: string): Builder
  /**
   * Add raw option
   * @param value [string]
   */
  public options(value: string): Builder
  public options(...args: string[]): Builder {
    if (args.length > 1) args[0] = `${args[0].toLocaleUpperCase()} ${args[1]}`
    if (!this.json.options) this.json.options = []
    this.json.options.push(args[0])
    return this
  }

  // @override
  public build(): Column {
    return new Column(this.json)
  }

  // @override
  public toJson(): IColumn {
    return _.cloneDeep(this.json)
  }
}

/**
 * Table column definition
 */
export class Column implements IColumn, IStringify {
  public static Builder = Builder

  public readonly name: string
  public readonly type: string
  public readonly typeArgs: any[] = []
  public readonly options: string[] = []

  constructor(name: string, type: string, ...typeArgs: any[])
  constructor(json: IColumn)
  constructor(...args: any[]) {
    if (args.length === 1) {
      const json = args[0] as IColumn
      this.name = json.name
      this.type = json.type
      if (json.typeArgs) this.typeArgs = json.typeArgs
      if (json.options) this.options = json.options
    }
    else {
      this.name = args[0]
      this.type = args[1]
      this.typeArgs = args.slice(2)
    }
  }

  // @override
  public toString(): string {
    return stringify(Column.name, this)
  }

  // @override
  public toJson(): IColumn {
    const json: IColumn = {
      name: this.name,
      type: this.type,
    }
    if (this.typeArgs.length) json.typeArgs = this.typeArgs
    if (this.options.length) json.options = this.options
    return json
  }
}
