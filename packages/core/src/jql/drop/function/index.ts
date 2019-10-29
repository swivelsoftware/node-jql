import { JQL } from '../..'
import { IDropFunctionJQL } from './index.if'

/**
 * drop function
 */
export class DropFunctionJQL extends JQL implements IDropFunctionJQL {
  // @override
  public readonly classname = DropFunctionJQL.name

  // @override
  public function: string

  // @override
  public $ifExists = false

  constructor(json?: string|IDropFunctionJQL) {
    super()

    if (typeof json === 'string') {
      this.setFunction(json)
    }
    else if (json) {
      this.setFunction(json.function)
    }
  }

  /**
   * set function
   * @param function [string]
   */
  public setFunction(name: string): DropFunctionJQL {
    this.function = name
    return this
  }

  /**
   * set IF EXISTS flag
   * @param flag [boolean]
   */
  public ifExists(flag = true): DropFunctionJQL {
    this.$ifExists = flag
    return this
  }

  // @override
  public toJson(): IDropFunctionJQL {
    this.check()
    return {
      classname: this.classname,
      function: this.function,
      $ifExists: this.$ifExists,
    }
  }

  // @override
  public toString(): String {
    this.check()
    return `DROP FUNCTION ${this.$ifExists ? 'IF EXISTS ' : ''}\`${this.function.toString()}\``
  }

  // @override
  protected check(): void {
    if (!this.function) throw new SyntaxError('Function is not defined')
  }
}
