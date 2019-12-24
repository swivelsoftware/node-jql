import _ = require('lodash')
import { IStringify } from '../index.if'
import { IBuilder } from '../index.if'
import { register } from '../parse'
import { ICreateSchema } from './index.if'

class Builder implements IBuilder<CreateSchema> {
  private json: ICreateSchema

  constructor(name: string) {
    this.json = {
      classname: CreateSchema.name,
      name,
    }
  }

  /**
   * Set `if not exists` flag
   * @param value [boolean]
   */
  public ifNotExists(value: boolean = true): Builder {
    this.json.ifNotExists = value
    return this
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
  public build(): CreateSchema {
    return new CreateSchema(this.json)
  }

  // @override
  public toJson(): ICreateSchema {
    return _.cloneDeep(this.json)
  }
}

/**
 * CREATE SCHEMA
 */
export class CreateSchema implements ICreateSchema, IStringify {
  public static Builder = Builder

  public readonly classname: string = CreateSchema.name
  public name: string
  public ifNotExists: boolean = false
  public options: string[] = []

  constructor(json: ICreateSchema|string) {
    if (typeof json === 'string') {
      this.name = json
    }
    else {
      this.name = json.name
      if (json.ifNotExists) this.ifNotExists = json.ifNotExists
      if (json.options) this.options = json.options
    }
  }

  // @override
  public toString(): string {
    let str = `${this.ifNotExists ? 'CREATE SCHEMA IF NOT EXISTS' : 'CREATE SCHEMA'} \`${this.name}\``
    if (this.options) str += ` ${this.options.join(' ')}`
    return str
  }

  // @override
  public toJson(): ICreateSchema {
    const json: ICreateSchema = {
      classname: this.classname,
      name: this.name,
    }
    if (this.ifNotExists) json.ifNotExists = this.ifNotExists
    return json
  }
}

register(CreateSchema)
