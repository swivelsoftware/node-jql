import { JQL } from '../..'
import { ISchemaTable } from '../../select/fromTable/index.if'
import { SchemaTable } from '../../select/fromTable/table'
import { IDropTableJQL } from './index.if'

/**
 * Drop table
 */
export class DropTableJQL extends JQL implements IDropTableJQL {
  // @override
  public readonly classname = DropTableJQL.name

  // @override
  public table: SchemaTable

  // @override
  public $ifExists = false

  constructor(json?: string|IDropTableJQL) {
    super()

    if (typeof json === 'string') {
      this.setTable(new SchemaTable(json))
    }
    else if (json) {
      this.setTable(json.table)
    }
  }

  /**
   * Set table
   * @param table [ISchemaTable]
   */
  public setTable(table: ISchemaTable): DropTableJQL {
    this.table = new SchemaTable(table)
    return this
  }

  /**
   * Set IF EXISTS flag
   * @param flag [boolean]
   */
  public ifExists(flag = true): DropTableJQL {
    this.$ifExists = flag
    return this
  }

  // @override
  public toJson(): IDropTableJQL {
    this.check()
    return {
      classname: this.classname,
      table: this.table.toJson(),
      $ifExists: this.$ifExists,
    }
  }

  // @override
  public toString(): String {
    this.check()
    return `DROP TABLE ${this.$ifExists ? 'IF EXISTS ' : ''}${this.table.toString()}`
  }

  // @override
  protected check(): void {
    if (!this.table) throw new SyntaxError('Table is not defined')
  }
}
