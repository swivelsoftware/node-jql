import { Expression } from '..'
import { register } from '../../parse'
import { IVariable } from './index.if'

/**
 * Defined variable
 */
export class Variable extends Expression implements IVariable {
  // @override
  public readonly classname = Variable.name

  // @override
  public name: string

  constructor(json?: string|IVariable)  {
    super()

    if (typeof json === 'string') {
      this.setName(json)
    }
    else if (json) {
      this.setName(json.name)
    }
  }

  /**
   * set variable name
   * @param name [string]
   */
  public setName(name: string): Variable {
    this.name = name
    return this
  }

  // @override
  public toJson(): IVariable {
    return {
      classname: this.classname,
      name: this.name,
    }
  }

  // @override
  public toString(): string {
    return '@' + this.name
  }
}

register(Variable)
