import { IExpression } from './index'

export interface IValueExpression extends IExpression {
  value?: any
  unknown?: boolean
}

export class ValueExpression implements IValueExpression {
  public readonly classname = '$value'
  public value: any

  constructor(json?: IValueExpression) {
    switch (typeof json) {
      case 'object':
        this.value = json.value
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return JSON.stringify(this.value)
  }
}
