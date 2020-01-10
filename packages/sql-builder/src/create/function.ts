import _ = require('lodash')
import { Type } from '..'
import { stringify } from '../dbType/stringify'
import { IBuilder, IStringify, IType } from '../index.if'
import { ICreateFunction } from './index.if'

class Builder implements IBuilder<CreateFunction> {
  private json: ICreateFunction

  constructor(name: string, returnType: IType)
  constructor(name: string, returnType: string, ...returnTypeArgs: any[])
  constructor(...args: any[]) {
    this.json = {
      classname: CreateFunction.name,
      name: args[0],
      returnType: new Type(args[1], ...args.slice(2)).toJson(),
      code: '',
    }
  }

  /**
   * Add parameter
   * @param name [string]
   * @param type [IType]
   */
  public param(name: string, type: IType): Builder

  /**
   * Add parameter
   * @param name [string]
   * @param type [string]
   * @param typeArgs [Array<any>]
   */
  public param(name: string, type: string, ...typeArgs: any[]): Builder

  public param(...args: any[]): Builder {
    if (!this.json.parameters) this.json.parameters = []
    this.json.parameters.push([
      args[0],
      new Type(args[1], args.slice(2)).toJson(),
    ])
    return this
  }

  /**
   * Set `deterministic` flag
   * @param flag [boolean]
   */
  public deterministic(flag = true): Builder {
    this.json.deterministic = flag
    return this
  }

  /**
   * Set code
   * @param code [string|Function]
   */
  public code(code: string|Function): Builder {
    if (typeof code === 'function') {
      code = code.toString()
      const open = code.indexOf('{')
      const close = code.lastIndexOf('}')
      code = code.substring(open + 1, close).trim()
      if (!code) throw new SyntaxError('Empty function')
    }
    this.json.code = code
    return this
  }

  // @override
  public build(): CreateFunction {
    return new CreateFunction(this.json)
  }

  // @override
  public toJson(): ICreateFunction {
    return _.cloneDeep(this.json)
  }
}

/**
 * CREATE FUNCTION
 */
export class CreateFunction implements ICreateFunction, IStringify {
  public static Builder = Builder

  public readonly classname: string = CreateFunction.name
  public readonly name: string
  public readonly parameters: Array<[string, Type]> = []
  public readonly returnType: Type
  public readonly code: string
  public readonly deterministic: boolean = false

  constructor(json: ICreateFunction) {
    this.name = json.name
    if (json.parameters) this.parameters = json.parameters.map(([name, type]) => ([name, new Type(type)]))
    this.returnType = new Type(json.returnType)
    this.code = json.code
    if (json.deterministic) this.deterministic = json.deterministic
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): ICreateFunction {
    const json: ICreateFunction = {
      classname: this.classname,
      name: this.name,
      returnType: this.returnType.toJson(),
      code: this.code,
    }
    if (this.parameters.length) json.parameters = this.parameters.map(([name, type]) => ([name, type.toJson()]))
    if (this.deterministic) json.deterministic = this.deterministic
    return json
  }
}
