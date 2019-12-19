import { Expression } from '.'
import { isUndefined } from '..'
import { register } from '../parse'
import { IValue } from './index.if'

/**
 * Constant value
 */
export class Value extends Expression implements IValue {
  public readonly classname: string = Value.name
  public readonly value: any

  constructor(json: IValue|any) {
    super()
    if (typeof json === 'object' && json !== null && json.classname === 'Value') {
      this.value = json.value
    }
    else {
      this.value = json
    }
  }

  // @override
  public toString(): string {
    return isUndefined(this.value) ? 'NULL' : JSON.stringify(this.value)
  }

  // @override
  public toJson(): IValue {
    return {
      classname: this.classname,
      value: this.value,
    }
  }
}

register(Value)
