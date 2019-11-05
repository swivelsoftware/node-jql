import { JQL } from '..'
import { Variable } from '../expressions/variable'
import { ISchemaTable } from '../select/fromTable/index.if'
import { SchemaTable } from '../select/fromTable/table'
import { IInsertJQL, InsertValue } from './index.if'

/**
 * INSERT INTO ...
 */
export class InsertJQL extends JQL implements IInsertJQL {
  // @override
  public readonly classname: string = InsertJQL.name

  // @override
  public $into: SchemaTable

  // @override
  public mappings: string[] = []

  // @override
  public $values: InsertValue[] = []

  constructor(json?: string|IInsertJQL) {
    super()

    if (typeof json === 'string') {
      this.into(new SchemaTable(json))
    }
    else if (json) {
      this.into(json.$into)
    }
  }

  /**
   * Set table
   * @param table [ISchemaTable]
   * @param mappings [Array<string>]
   */
  public into(table: ISchemaTable, mappings: string[] = []): InsertJQL {
    this.$into = new SchemaTable(table)
    this.mappings = [...mappings]
    this.$values = []
    return this
  }

  /**
   * Add value
   * @param value [InsertValue]
   */
  public addValue(value: InsertValue): InsertJQL {
    this.checkValues([value])
    this.$values.push(value)
    return this
  }

  // @override
  public toJson(): IInsertJQL {
    this.check()
    return {
      classname: this.classname,
      $into: this.$into.toJson(),
      mappings: this.mappings,
      $values: this.$values,
    }
  }

  // @override
  public toString(): string {
    this.check()
    let result = `INSERT INTO ${this.$into.toString()}`
    if (this.mappings.length) result += ` (${this.mappings.map(m => `\`${m}\``).join(', ')})`
    result += ` VALUES ${this.$values.map(v => `(${v.map(v_ => v_ instanceof Variable ? v_.toString() : JSON.stringify(v_)).join(', ')})`).join(', ')}`
    return result
  }

  // @override
  protected check(): void {
    if (!this.$into) throw new SyntaxError('Table is not defined')
    if (!this.$values.length) throw new SyntaxError('Insert values is not defined')
  }

  private checkValues($values = this.$values): void {
    if (this.mappings.length) {
      for (const v of $values) {
        if (v.length !== this.mappings.length) throw new SyntaxError(`Unmatched amount of columns: ${`(${v.map(v_ => JSON.stringify(v_)).join(', ')})`}`)
      }
    }
  }
}
