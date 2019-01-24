import { Sql } from "./index";
import { createFunction } from "utils/createFunction";

interface DefineJson extends Sql {
  name: string
  value?: string | number | bigint | boolean
  function?: Function | string
}

export class DefineStatement implements DefineJson {
  name: string
  value?: string | number | bigint | boolean
  function?: Function

  constructor (defineStatement?: DefineStatement) {
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

  validate (): boolean {
    // no need to check
    return true
  }
}