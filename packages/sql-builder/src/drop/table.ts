import _ = require('lodash')
import { IStringify } from '../index.if'
import { IBuilder } from '../index.if'
import { register } from '../parse'
import { IDropTable } from './index.if'

class Builder implements IBuilder<DropTable> {
  private json: IDropTable

  constructor(name: string) {
    this.json = {
      classname: DropTable.name,
      name,
    }
  }

  /**
   * Set `database` for the table
   * @param database [string]
   */
  public database(database: string): Builder {
    this.json.database = database
    return this
  }

  /**
   * Set `if exists` flag
   * @param value [boolean]
   */
  public ifExists(value: boolean = true): Builder {
    this.json.ifExists = value
    return this
  }

  // @override
  public build(): DropTable {
    return new DropTable(this.json)
  }

  // @override
  public toJson(): IDropTable {
    return _.cloneDeep(this.json)
  }
}

/**
 * CREATE TABLE
 */
export class DropTable implements IDropTable, IStringify {
  public static Builder = Builder

  public readonly classname: string = DropTable.name
  public readonly ifExists: boolean = false
  public readonly database?: string
  public readonly name: string

  constructor(json: string|IDropTable) {
    if (typeof json === 'string') {
      this.name = json
    }
    else {
      this.ifExists = json.ifExists
      this.database = json.database
      this.name = json.name
    }
  }

  // @override
  public toJson(): IDropTable {
    const json: IDropTable = {
      classname: this.classname,
      name: this.name,
    }
    if (this.database) json.database = this.database
    if (this.ifExists) json.ifExists = this.ifExists
    return json
  }
}

register(DropTable)
