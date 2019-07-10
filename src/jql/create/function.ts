import squel = require('squel')
import { IJQL, JQL } from '..'
import { Type } from '../../Type'
import { JQLError } from '../../utils/error'
import { IParseable } from '../parse'

function parseFunction(code: string): Function {
  code = code.trim()

  if (!code.startsWith('function')) throw new SyntaxError(`Position 0: Keyword 'function' is missing`)

  const argsIndex = [code.indexOf('(') + 1, code.indexOf(')')]
  const bodyIndex = [code.indexOf('{') + 1, code.lastIndexOf('}')]
  if (argsIndex[1] > bodyIndex[0]) throw new SyntaxError(`Position ${bodyIndex[0]}: Curved bracket '{}' is not allowed in argument section 'function()'`)
  if (bodyIndex[1] - bodyIndex[0] === 1) throw new SyntaxError(`Position ${bodyIndex[0]}: Empty function`)

  let args: string[] = []
  if (argsIndex[1] - argsIndex[0] > 1) {
    args = code.substring(argsIndex[0], argsIndex[1]).split(',').map(pc => pc.trim())
  }
  args.push(code.substring(bodyIndex[0], bodyIndex[1]))

  return new Function(...args)
}

/**
 * Raw JQL for `CREATE FUNCTION ...`
 */
export interface ICreateFunctionJQL extends IJQL, IParseable {
  /**
   * Function name
   */
  name: string

  /**
   * Main function
   */
  fn: string|Function

  /**
   * Parameters
   */
  parameters?: Type[]

  /**
   * Return type
   */
  type?: Type
}

/**
 * JQL class for `CREATE FUNCTION ...`
 */
export class CreateFunctionJQL extends JQL implements ICreateFunctionJQL {
  public readonly classname = CreateFunctionJQL.name
  public name: string
  public fn: Function
  public parameters: Type[] = []
  public type: Type = 'any'

  /**
   * @param json [Partial<ICreateFunctionJQL>]
   */
  constructor(json: Partial<ICreateFunctionJQL>)

  /**
   * @param name [string]
   * @param fn [string|Function]
   * @param type [Type] optional
   * @param parameters [Array<Type>] optional
   */
  constructor(name: string, fn: string|Function, type?: Type, ...parameters: Type[])

  constructor(...args: any[]) {
    super()

    // parse args
    let name: string, fn: Function, type: Type = 'any', parameters: Type[] = []
    if (typeof args[0] === 'object') {
      const json = args[0] as ICreateFunctionJQL
      name = json.name
      fn = typeof json.fn === 'string' ? parseFunction(json.fn) : json.fn
      if (json.type) type = json.type
      if (json.parameters) parameters = json.parameters
    }
    else {
      name = args[0]
      fn = typeof args[1] === 'string' ? parseFunction(args[1]) : args[1]
      type = args[2] || type
      parameters = args.slice(3)
    }

    // set args
    this.name = name
    this.fn = fn
    this.type = type
    this.parameters = parameters
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.BaseBuilder {
    throw new JQLError('CREATE FUNCTION JQL cannot be converted to SQL format')
  }

  // @override
  public toJson(): ICreateFunctionJQL {
    const result = { name: this.name, fn: this.fn.toString() } as ICreateFunctionJQL
    if (this.type !== 'any') result.type = this.type
    if (this.parameters.length) result.parameters = this.parameters
    return result
  }
}
