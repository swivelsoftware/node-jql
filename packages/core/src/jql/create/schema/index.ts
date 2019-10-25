import { JQL } from '../..'
import { ICreateSchemaJQL } from './index.if'

/**
 * create schema
 */
export class CreateSchemaJQL extends JQL implements ICreateSchemaJQL {
  // @override
  public readonly classname = CreateSchemaJQL.name

  // @override
  public name: string

  // @override
  public $ifNotExists = false

  // @override
  public options: string[] = []

  constructor(json?: string|ICreateSchemaJQL) {
    super()

    if (typeof json === 'string') {
      this.setSchema(json)
    }
    else if (json) {
      this.setSchema(json.name)
      if (json.$ifNotExists) this.ifNotExists()
    }
  }

  /**
   * set table
   * @param name [string]
   */
  public setSchema(name: string): CreateSchemaJQL {
    this.name = name
    return this
  }

  /**
   * set IF NOT EXISTS flag
   * @param flag [boolean]
   */
  public ifNotExists(flag = true): CreateSchemaJQL {
    this.$ifNotExists = flag
    return this
  }

  /**
   * add extra option
   * @param value [string]
   */
  public addOption(value: string): CreateSchemaJQL {
    this.options.push(value)
    return this
  }

  // @override
  public toJson(): ICreateSchemaJQL {
    this.check()
    return {
      classname: this.classname,
      name: this.name,
      $ifNotExists: this.$ifNotExists,
      options: this.options,
    }
  }

  // @override
  public toString(): String {
    this.check()
    let result = `CREATE SCHEMA ${this.$ifNotExists ? 'IF NOT EXISTS ' : ''}\`${this.name}\``
    if (this.options.length) result += this.options.map(o => o.trim()).join(' ')
    return result
  }

  // @override
  protected check(): void {
    if (!this.name) throw new SyntaxError('Schema is not defined')
  }
}
