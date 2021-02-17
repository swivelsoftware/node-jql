import squel from 'squel'
import { Expression } from '..'
import { IVariable } from '../interface'

/**
 * JQL class defining variable
 */
export class Variable extends Expression implements IVariable {
  public readonly classname = Variable.name
  public name: string

  /**
   * @param json [Partial<IVariable>]
   */
  constructor(json: Partial<IVariable>)

  /**
   * @param name [string]
   */
  constructor(name: string)

  constructor(...args: any[]) {
    super()

    // parse args
    let name: string
    if (typeof args[0] !== 'string') {
      const json = args[0] as IVariable
      name = json.name
    }
    else {
      name = args[0]
    }

    // check args
    if (!name) throw new SyntaxError('Missing variable name')

    // set args
    this.name = name
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(type: squel.Flavour = 'mysql'): squel.FunctionBlock {
    const Squel = squel.useFlavour(type as any)
    return Squel.rstr(`@${this.name}`)
  }

  // @override
  public toJson(): IVariable {
    const result: IVariable = {
      classname: this.classname,
      name: this.name,
    }
    return result
  }
}
