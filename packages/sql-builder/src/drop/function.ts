import _ = require('lodash')
import { stringify } from '../dbType/stringify'
import { IStringify } from '../index.if'
import { IBuilder } from '../index.if'
import { register } from '../parse'
import { IDropFunction } from './index.if'

class Builder implements IBuilder<DropFunction> {
  private json: IDropFunction

  constructor(name: string) {
    this.json = {
      classname: DropFunction.name,
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
  public build(): DropFunction {
    return new DropFunction(this.json)
  }

  // @override
  public toJson(): IDropFunction {
    return _.cloneDeep(this.json)
  }
}

/**
 * CREATE SCHEMA
 */
export class DropFunction implements IDropFunction, IStringify {
  public static Builder = Builder

  public readonly classname: string = DropFunction.name
  public name: string
  public ifExists: boolean = false

  constructor(json: string|IDropFunction) {
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
    return stringify(DropFunction.name, this)
  }

  // @override
  public toJson(): IDropFunction {
    const json: IDropFunction = {
      classname: this.classname,
      name: this.name,
    }
    if (this.ifExists) json.ifExists = this.ifExists
    return json
  }
}

register(DropFunction)
