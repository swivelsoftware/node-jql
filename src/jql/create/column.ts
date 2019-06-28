import { IJql, Jql } from '..'
import { ColumnBlock } from '../squel'

/**
 * Raw JQL defining column
 */
export interface IColumn<Type = any> extends IJql {
  /**
   * Column name
   */
  name: string

  /**
   * Column type
   */
  type: Type

  /**
   * Whether the column is nullable
   */
  nullable?: boolean

  /**
   * Extra options
   */
  options?: string[]|string
}

/**
 * JQL class defining column
 */
export class Column<Type = any> extends Jql implements IColumn<Type> {
  public name: string
  public type: Type
  public nullable: boolean
  public options?: string[]

  /**
   * @param json [IColumn<Type>]
   */
  constructor(json: IColumn<Type>)

  /**
   * @param name [string]
   * @param type [Type]
   * @param nullable [boolean] optional
   * @param options [Array<string>] optional
   */
  constructor(name: string, type: Type, nullable?: boolean, ...options: string[])

  constructor(...args: any) {
    super()

    // parse args
    let name: string, type: Type, nullable: boolean|undefined, options: string[]|string|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as IColumn<Type>
      name = json.name
      type = json.type
      nullable = json.nullable
      options = json.options
    }
    else {
      name = args[0]
      type = args[1]
      nullable = args[2]
      options = args.slice(3)
    }

    // set args
    this.name = name
    this.type = type
    this.nullable = nullable || false
    if (options) {
      if (!Array.isArray(options)) options = [options]
      this.options = options
    }
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): ColumnBlock {
    const builder = new ColumnBlock().name(this.name).type(String(this.type))
    if (this.nullable) builder.nullable()
    if (this.options) for (const option of this.options) builder.option(option)
    return builder
  }

  // @override
  public toJson(): IColumn {
    const result = { name: this.name, type: this.type } as IColumn<Type>
    if (this.nullable) result.nullable = true
    if (this.options) result.options = this.options
    return result
  }
}
