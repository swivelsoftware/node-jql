import { Expression } from '.'
import { register } from '../parse'
import { IVariable } from './index.if'

/**
 * Variable
 */
export class Variable extends Expression implements IVariable {
  public readonly classname: string = Variable.name
  public readonly name: string

  constructor(json: string|IVariable) {
    super()
    if (typeof json === 'string') {
      this.name = json
    }
    else {
      this.name = json.name
    }
  }

  // @override
  public toJson(): IVariable {
    return {
      classname: this.classname,
      name: this.name,
    }
  }
}

register(Variable)
