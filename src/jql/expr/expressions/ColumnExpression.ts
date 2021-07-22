import squel from 'squel'
import { Expression } from '..'
import { quoteTable } from '../../../utils/quote'
import { IColumnExpression } from '../interface'

/**
 * JQL class defining column expression
 */
export class ColumnExpression extends Expression implements IColumnExpression {
  public readonly classname = ColumnExpression.name
  public table?: string
  public name: string

  /**
   * @param json [Partial<IColumnExpression>]
   */
  constructor(json: Partial<IColumnExpression>)

  /**
   * @param table [string|null]
   * @param name [string]
   */
  constructor(table: string|null, name: string)

  /**
   * @param name [string]
   */
  constructor(name: string)

  constructor(...args: any[]) {
    super()

    // parse args
    let table: string|undefined, name: string
    if (typeof args[0] !== 'string') {
      const json = args[0] as IColumnExpression
      table = json.table
      name = json.name
    }
    else if (args.length === 1) {
      table = undefined
      name = args[0]
    }
    else {
      table = args[0] || undefined
      name = args[1]
    }

    // check args
    if (!name) throw new SyntaxError('Missing column name')

    // set args
    this.table = table
    this.name = name
  }

  get isWildcard(): boolean {
    return this.name === '*'
  }

  // @override
  public validate(availableTables: string[]): void {
    if (this.table && availableTables.indexOf(this.table) === -1) {
      throw new SyntaxError(`Unknown table ${this.table}`)
    }
  }

  // @override
  public toSquel(type: squel.Flavour = 'mysql'): squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    return squel_.rstr(`${this.table ? `${quoteTable(type, this.table)}.` : ''}${this.isWildcard ? '*' : quoteTable(type, this.name)}`)
  }

  // @override
  public toJson(): IColumnExpression {
    const result: IColumnExpression = {
      classname: this.classname,
      name: this.name,
    }
    if (this.table) result.table = this.table
    return result
  }
}
