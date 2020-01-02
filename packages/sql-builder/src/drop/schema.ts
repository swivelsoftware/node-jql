import _ = require('lodash')
import { stringify } from '../dbType/stringify'
import { IStringify } from '../index.if'
import { IBuilder } from '../index.if'
import { register } from '../parse'
import { IDropSchema } from './index.if'

class Builder implements IBuilder<DropSchema> {
  private json: IDropSchema

  constructor(name: string) {
    this.json = {
      classname: DropSchema.name,
      name,
    }
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
  public build(): DropSchema {
    return new DropSchema(this.json)
  }

  // @override
  public toJson(): IDropSchema {
    return _.cloneDeep(this.json)
  }
}

/**
 * CREATE SCHEMA
 */
export class DropSchema implements IDropSchema, IStringify {
  public static Builder = Builder

  public readonly classname: string = DropSchema.name
  public name: string
  public ifExists: boolean = false

  constructor(json: string|IDropSchema) {
    if (typeof json === 'string') {
      this.name = json
    }
    else {
      this.name = json.name
      if (json.ifExists) this.ifExists = json.ifExists
    }
  }

  // @override
  public toString(): string {
    return stringify(DropSchema.name, this)
  }

  // @override
  public toJson(): IDropSchema {
    const json: IDropSchema = {
      classname: this.classname,
      name: this.name,
    }
    if (this.ifExists) json.ifExists = this.ifExists
    return json
  }
}

register(DropSchema)
