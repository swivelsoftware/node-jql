import _ = require('lodash')
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

  constructor(json: IColumn) {
    this.name = json.name
    this.type = json.type
    if (json.typeArgs) this.typeArgs = json.typeArgs
    if (json.options) this.options = json.options
  }

  // @override
  public toString(): string {
    let str = `\`${this.name}\` ${this.type}`
    if (this.typeArgs.length) str += `(${this.typeArgs.map(arg => JSON.stringify(arg)).join(', ')})`
    if (this.options.length) str += ` ${this.options.join(' ')}`
    return str
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
