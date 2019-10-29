import { JQL } from '../..'
import { Type } from '../../index.if'
import { ICreateFunctionJQL } from './index.if'

/**
 * create function
 */
export class CreateFunctionJQL<T = Type> extends JQL implements ICreateFunctionJQL<T> {
  // @override
  public readonly classname = CreateFunctionJQL.name

  // @override
  public name: string

  // @override
  public parameters: Array<[string, T]> = []

  // @override
  public returnType: T

  // @override
  public code: string

  constructor(json?: string|ICreateFunctionJQL<T>) {
    super()

    if (typeof json === 'string') {
      this.setName(json)
    }
    else if (json) {
      this.setName(json.name)
      if (json.parameters) for (const [name, type] of json.parameters) this.addParameter(name, type)
      this.setReturnType(json.returnType)
      this.setCode(json.code)
    }
  }

  /**
   * set function name
   * @param name [string]
   */
  public setName(name: string): CreateFunctionJQL<T> {
    this.name = name
    return this
  }

  /**
   * add parameter definition
   * @param name [string]
   * @param type [T]
   */
  public addParameter(name: string, type: T): CreateFunctionJQL<T> {
    this.parameters.push([name, type])
    return this
  }

  /**
   * set return data type
   * @param type [T]
   */
  public setReturnType(type: T): CreateFunctionJQL<T> {
    this.returnType = type
    return this
  }

  /**
   * set function code
   * @param code [string]
   */
  public setCode(code: string): CreateFunctionJQL<T> {
    this.code = code
    return this
  }

  // @override
  public toJson(): ICreateFunctionJQL<T> {
    this.check()
    return {
      classname: this.classname,
      name: this.name,
      parameters: this.parameters,
      returnType: this.returnType,
      code: this.code,
    }
  }

  // @override
  public toString(): String {
    this.check()
    let result = `CREATE FUNCTION \`${this.name}\``
    if (this.parameters.length) {
      result += ` (${this.parameters.map(([name, type]) => `${name} ${type}`).join(', ')})`
    }
    result += ` RETURNS ${this.returnType}`
    result += '\nBEGIN\n\t'
    result += this.code.split('\n').join('\n\t')
    result += '\nEND'
    return result
  }

  // @override
  protected check(): void {
    if (!this.name) throw new SyntaxError('Function name is not defined')
    if (!this.returnType) throw new SyntaxError('Return type is not defined')
    if (!this.code) throw new SyntaxError('Function code is not defined')
  }
}
