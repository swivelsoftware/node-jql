import { IConstraint, IStringify } from './index.if'
import { register } from './parse'

/**
 * Raw string constraint
 */
export class Constraint implements IConstraint, IStringify {
  public readonly classname: string = Constraint.name
  public value: string

  constructor(json: IConstraint|string) {
    if (typeof json === 'string') {
      this.value = json
    }
    else {
      this.value = json.value
    }
  }

  // @override
  public toString(): string {
    return this.value
  }

  // @override
  public toJson(): IConstraint {
    return {
      classname: this.classname,
      value: this.value,
    }
  }
}

register(Constraint)
