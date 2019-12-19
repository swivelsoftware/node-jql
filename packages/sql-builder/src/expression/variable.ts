import { Expression } from '.'
import { register } from '../parse'
import { IVariable } from './index.if'

/**
 * Variable
 */
export class Variable extends Expression implements IVariable {
  public readonly classname: string = Variable.name
  public readonly name: string

  constructor(json: IVariable|string) {
    super()
    if (typeof json === 'object') {
      this.name = json.name
    }
    else {
      this.name = json
    }
  }

  // @override
  public toString(): string {
    return `@${this.name}`
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
