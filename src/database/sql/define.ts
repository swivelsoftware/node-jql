import { createFunction } from '../../utils/createFunction'
import { Sql } from './index'

export interface IDefineStatement {
  name: string
  value?: string | number | boolean
  function?: Function | string
}

export class DefineStatement extends Sql implements IDefineStatement {
  public name: string
  public value?: string | number | boolean
  public function?: Function

  constructor(defineStatement?: DefineStatement) {
    super()
    switch (typeof defineStatement) {
      case 'object':
        this.name = defineStatement.name
        this.value = defineStatement.value
        this.function = typeof defineStatement.function === 'string' ? createFunction(defineStatement.function) : defineStatement.function
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'defineStatement' object`)
    }
  }

  public validate(): boolean {
    // no need to check
    return true
  }
}
