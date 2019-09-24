import { Expression } from '..'
import { IExpression } from '../index.if'
import { register } from '../parse'
import { IFunctionExpression } from './index.if'

/**
 * {name}({parameters})
 */
export class FunctionExpression extends Expression implements IFunctionExpression {
  // @override
  public readonly classname: string = FunctionExpression.name

  // @override
  public name: string

  // @override
  public parameters: Expression[]

  constructor(json: IFunctionExpression)
  constructor(name: string, ...parameters: Expression[])
  constructor(...args: any[]) {
    super()

    // parse
    let name: string, parameters: IExpression[]
    if (args.length === 1 && typeof args[0] === 'object') {
      const json = args[0] as IFunctionExpression
      name = json.name
      parameters = json.parameters || []
    }
    else {
      name = args[0] as string
      parameters = args.slice(1) as Expression[]
    }

    // set
    this.name = name
    this.parameters = this.parameters
  }

  // @override
  public toJson(): IFunctionExpression {
    return {
      classname: this.classname,
      name: this.name,
      parameters: this.parameters.map(e => e.toJson()),
    }
  }
}

register(FunctionExpression)
