import squel = require('squel')
import { Expression, IExpression } from '..'
import { parse } from '../parse'
import { ParameterExpression } from './ParameterExpression'

/**
 * Raw JQL defining function expression
 */
export interface IFunctionExpression extends IExpression {
  /**
   * Function name
   */
  name: string

  /**
   * Parameters
   */
  parameters?: any[]|any
}

/**
 * JQL class defining function expression
 */
export class FunctionExpression extends Expression implements IFunctionExpression {
  public readonly classname = FunctionExpression.name
  public name: string
  public parameters: ParameterExpression[]

  /**
   * @param json [Partial<IFunctionExpression>]
   */
  constructor(json: Partial<IFunctionExpression>)

  /**
   * @param name [string]
   * @param parameters [Array] optional
   */
  constructor(name: string, ...parameters: any[])

  constructor(...args: any[]) {
    super()

    // parse args
    let name: string, parameters: any[]
    if (typeof args[0] === 'object') {
      const json = args[0] as IFunctionExpression
      name = json.name
      json.parameters = json.parameters || []
      parameters = Array.isArray(json.parameters) ? json.parameters : [json.parameters]
    }
    else {
      name = args[0]
      parameters = args.slice(1)
    }

    // check args
    if (!name) throw new SyntaxError('Missing function name')

    // set args
    this.name = name.toLocaleUpperCase()
    this.parameters = parameters.map(parameter => {
      let expression = parse(parameter)
      if (!(expression instanceof ParameterExpression)) expression = new ParameterExpression({ expression })
      return expression as ParameterExpression
    })
  }

  // @override
  public validate(availableTables: string[]) {
    for (const parameter of this.parameters) parameter.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr(
      `${this.name.toLocaleUpperCase()}(${this.parameters.map(() => '?').join(', ')})`,
      ...this.parameters.map(parameter => parameter.toSquel()),
    )
  }

  // @override
  public toJson(): IFunctionExpression {
    const result: IFunctionExpression = {
      classname: this.classname,
      name: this.name,
    }
    if (this.parameters.length > 0) result.parameters = this.parameters.map(expression => expression.toJson())
    return result
  }
}
