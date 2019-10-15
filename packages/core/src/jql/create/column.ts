import { JQL } from '..'
import { Type } from '../index.if'
import { IColumnDef } from './index.if'

/**
 * Column definition
 */
export class ColumnDef extends JQL implements IColumnDef {
  // @override
  public readonly classname: string = ColumnDef.name

  // @override
  public name: string

  // @override
  public type: Type = 'any'

  // @override
  public length?: number

  // @override
  public notNull = false

  // @override
  public autoIncrement = false

  constructor(json?: IColumnDef) {
    super()

    if (json) {
      this.setColumn(json.name, json.type, json.length)
      if (this.notNull) this.setNotNull()
      if (this.autoIncrement) this.setAutoIncrement()
    }
  }

  /**
   * set column definition
   * @param name [string]
   * @param type [Type]
   */
  public setColumn(name: string, type: Type, length?: number): ColumnDef {
    this.name = name
    this.type = type
    this.length = length
    return this
  }

  /**
   * set NOT NULL flag
   * @param flag [boolean]
   */
  public setNotNull(flag = true): ColumnDef {
    this.notNull = flag
    return this
  }

  /**
   * set AUTO_INCREMENT flag
   * @param flag [boolean]
   */
  public setAutoIncrement(flag = true): ColumnDef {
    this.autoIncrement = flag
    return this
  }

  // @override
  public toJson(): IColumnDef {
    this.check()
    return {
      classname: this.classname,
      name: this.name,
      type: this.type,
      length: this.length,
      notNull: this.notNull,
      autoIncrement: this.autoIncrement,
    }
  }

  // @override
  public toString(): string {
    this.check()
    let result = `\`${this.name}\` ${this.type}`
    if (this.length !== undefined) result += `(${this.length})`
    if (this.notNull) result += ` NOT NULL`
    if (this.autoIncrement) result += ` AUTO_INCREMENT`
    return result
  }

  // @override
  protected check(): void {
    if (!this.name) throw new SyntaxError('Column name is not defined')
  }
}
