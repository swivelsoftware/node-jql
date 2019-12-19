import _ = require('lodash')
import format = require('string-format')
import { Expression } from '.'
import { isUndefined } from '..'
import * as $ from '..'
import { IBuilder, IExpression } from '../index.if'
import { parse, register } from '../parse'
import { formats, validations } from './functions'
import { IFunctionExpression } from './index.if'

class Builder implements IBuilder<FunctionExpression> {
  private json: IFunctionExpression

  constructor(name: string) {
    this.json = {
      classname: FunctionExpression.name,
      name,
    }
  }

  /**
   * Add argument
   * @param json [IExpression]
   */
  public arg(json: IExpression): Builder {
    if (isUndefined(this.json.arguments)) this.json.arguments = []
    this.json.arguments.push(json)
    return this
  }

  // @override
  public build(): FunctionExpression {
    const result = new FunctionExpression(this.json)
    if (!result.isValid) throw new SyntaxError(`Invalid arguments for function '${result.name}'`)
    return result
  }

  // @override
  public toJson(): IFunctionExpression {
    return _.cloneDeep(this.json)
  }
}

/**
 * Function expression
 */
export class FunctionExpression extends Expression implements IFunctionExpression {
  public static Builder = Builder

  public readonly classname: string = FunctionExpression.name
  public readonly name: string
  public readonly arguments: Expression[] = []

  constructor(json: IFunctionExpression) {
    super()
    this.name = json.name
    if (json.arguments) {
      this.arguments = json.arguments.map(json => parse(json))
    }
  }

  /**
   * Check whether arguments are valid
   */
  get isValid(): boolean {
    const name = this.name.toLocaleLowerCase()
    const $validations = validations[$.dbType]
    for (const key of Object.keys($validations)) {
      if (key.toLocaleLowerCase() === name) return $validations[key](this.arguments)
    }
    return true
  }

  /**
   * Arguments format
   */
  get argsFormat(): string|null {
    const name = this.name.toLocaleLowerCase()
    const $formats = formats[$.dbType]
    for (const key of Object.keys($formats)) {
      if (key.toLocaleLowerCase() === name) return $formats[key]
    }
    return null
  }

  // @override
  public toString(): string {
    const parameters_ = this.arguments.map(expr => expr.toString())
    if (isUndefined(this.argsFormat)) {
      return `${this.name.toLocaleUpperCase()}(${parameters_.join(', ')})`
    }
    else {
      return `${this.name.toLocaleUpperCase()}(${format(this.argsFormat, ...parameters_)})`
    }
  }

  // @override
  public toJson(): IFunctionExpression {
    const json: IFunctionExpression = {
      classname: this.classname,
      name: this.name,
    }
    json.arguments = this.arguments.map(expr => expr.toJson())
    return json
  }
}

register(FunctionExpression)
