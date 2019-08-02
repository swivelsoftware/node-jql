import { JQL } from '..'
import { IDropJQL } from './interface'

/**
 * JQL class defining DROP statements
 */
export abstract class DropJQL extends JQL implements IDropJQL {
  public readonly classname = DropJQL.name
  public name: string
  public $ifExists: boolean

  /**
   * @param json [Partial<IDropJQL>]
   */
  constructor(json: Partial<IDropJQL>)

  /**
   * @param name [string]
   * @param $ifExists [boolean] optionsl
   */
  constructor(name: string, $ifExists?: boolean)

  constructor(...args: any[]) {
    super()

    // parse args
    let name: string|undefined, $ifExists: boolean|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as Partial<IDropJQL>
      name = json.name
      $ifExists = json.$ifExists
    }
    else {
      name = args[0]
      $ifExists = args[1]
    }

    // check args
    if (!name) throw new SyntaxError('Missing name')
    if (typeof name !== 'string') throw new SyntaxError(`Invalid name ${name}`)

    // set args
    this.name = name
    this.$ifExists = $ifExists || false
  }

  // @override
  get [Symbol.toStringTag](): string {
    return this.classname
  }

  // @override
  public toJson(): IDropJQL {
    const result = { classname: this.classname, name: this.name } as IDropJQL
    if (this.$ifExists) result.$ifExists = true
    return result
  }
}
