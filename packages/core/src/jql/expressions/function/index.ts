import format from 'string-format'
import { Expression } from '..'
import { checkNull } from '../../../utils'
import { parse, register } from '../../parse'
import { IExpression } from '../index.if'
import { formats } from './formats'
import { IFunctionExpression } from './index.if'

/**
 * {name}({parameters})
 */
export class FunctionExpression extends Expression implements IFunctionExpression {
  // @override
  public readonly classname = FunctionExpression.name

  // @override
  public name: string

  // @override
  public parameters: Expression[] = []

  constructor(json?: string|IFunctionExpression) {
    super()

    if (typeof json === 'string') {
      this.setFunction(json)
    }
    else if (json) {
      this.setFunction(json.name)
      if (json.parameters) {
        for (const param of json.parameters) this.addParameter(param)
      }
    }
  }

  /**
   * Set function
   * @param name [string]
   */
  public setFunction(name: string): FunctionExpression {
    this.name = name
    return this
  }

  /**
   * Add parameter
   * @param expr [IExpression]
   */
  public addParameter(expr: IExpression): FunctionExpression {
    this.parameters.push(parse(expr))
    return this
  }

  // @override
  public toJson(): IFunctionExpression {
    this.check()
    return {
      classname: this.classname,
      name: this.name,
      parameters: this.parameters.map(e => e.toJson()),
    }
  }

  // @override
  public toString(): string {
    this.check()
    const format_ = this.find()
    const parameters_ = this.parameters.map(e => e.toString())
    if (checkNull(format_)) {
      return `${this.name.toLocaleUpperCase()}(${parameters_.join(', ')})`
    }
    else {
      return `${this.name.toLocaleUpperCase()}(${format(format_ as string, ...parameters_)})`
    }
  }

  // @override
  protected check(): void {
    if (!this.name) throw new SyntaxError('Function name is not defined')
  }

  private find(): string|null {
    const name = this.name.toLocaleLowerCase()
    for (const key of Object.keys(formats)) {
      if (key.toLocaleLowerCase() === name) return formats[key]
    }
    return null
  }
}

register(FunctionExpression)
