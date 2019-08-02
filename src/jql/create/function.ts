import squel from 'squel'
import { CreateJQL } from '.'
import { Type } from '../../type'
import { JQLError } from '../../utils/error'
import { ICreateFunctionJQL } from './interface'

/**
 * JQL class for `CREATE FUNCTION ...`
 */
export class CreateFunctionJQL extends CreateJQL implements ICreateFunctionJQL {
  public readonly classname = CreateFunctionJQL.name
  public aggregate?: boolean
  public code: string
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

  /**
   * @param aggregate [boolean]
   * @param name [string]
   * @param fn [string|Function]
   * @param type [Type] optional
   * @param parameters [Array<Type>] optional
   */
  constructor(aggregate: true, name: string, fn: string|Function, type?: Type, ...parameters: Type[])

  constructor(...args: any[]) {
    super(typeof args[0] === 'boolean' ? args[1] : args[0], typeof args[0] === 'object' ? undefined : true)

    // parse args
    let aggregate: boolean|undefined, $ifNotExists = false, code: string, type: Type = 'any', parameters: Type[] = []
    if (typeof args[0] === 'object') {
      const json = args[0] as ICreateFunctionJQL
      aggregate = json.aggregate
      $ifNotExists = json.$ifNotExists || false
      code = json.code
      if (json.type) type = json.type
      if (json.parameters) parameters = json.parameters
    }
    else if (typeof args[0] === 'boolean') {
      aggregate = args[0]
      code = typeof args[2] === 'function' ? args[2].toString() : args[2]
      type = args[3] || type
      parameters = args.slice(4)
    }
    else {
      code = typeof args[1] === 'function' ? args[1].toString() : args[1]
      type = args[2] || type
      parameters = args.slice(3)
    }

    // check args
    if (aggregate && this.parameters.length > 1) throw new SyntaxError('Aggregate function supports only 1 parameter')

    // set args
    this.aggregate = aggregate
    this.code = code
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
    const result = { name: this.name, code: this.code } as ICreateFunctionJQL
    if (this.aggregate) result.aggregate = this.aggregate
    if (this.type !== 'any') result.type = this.type
    if (this.parameters.length) result.parameters = this.parameters
    return result
  }
}
