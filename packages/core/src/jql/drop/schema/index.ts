import { JQL } from '../..'
import { IDropSchemaJQL } from './index.if'

/**
 * drop schema
 */
export class DropSchemaJQL extends JQL implements IDropSchemaJQL {
  // @override
  public readonly classname = DropSchemaJQL.name

  // @override
  public name: string

  // @override
  public $ifExists = false

  constructor(json?: string|IDropSchemaJQL) {
    super()

    if (typeof json === 'string') {
      this.setSchema(json)
    }
    else if (json) {
      this.setSchema(json.name)
      if (json.$ifExists) this.ifExists()
    }
  }

  /**
   * set table
   * @param name [string]
   */
  public setSchema(name: string): DropSchemaJQL {
    this.name = name
    return this
  }

  /**
   * set IF EXISTS flag
   * @param flag [boolean]
   */
  public ifExists(flag = true): DropSchemaJQL {
    this.$ifExists = flag
    return this
  }

  // @override
  public toJson(): IDropSchemaJQL {
    this.check()
    return {
      classname: this.classname,
      name: this.name,
      $ifExists: this.$ifExists,
    }
  }

  // @override
  public toString(): String {
    this.check()
    return `DROP SCHEMA ${this.$ifExists ? 'IF EXISTS ' : ''}\`${this.name}\``
  }

  protected check(): void {
    if (!this.name) throw new SyntaxError('Schema is not defined')
  }
}
