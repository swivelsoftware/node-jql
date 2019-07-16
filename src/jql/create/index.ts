import { JQL } from '..'
import { ICreateJQL } from './interface'

/**
 * JQL class defining CREATE statements
 */
export abstract class CreateJQL extends JQL implements ICreateJQL {
  public readonly classname = CreateJQL.name
  public name: string
  public $ifNotExists: boolean

  /**
   * @param json [Partial<ICreateJQL>]
   */
  constructor(json: Partial<ICreateJQL>)

  /**
   * @param name [string]
   * @param $ifNotExists [boolean] optionsl
   */
  constructor(name: string, $ifNotExists?: boolean)

  constructor(...args: any[]) {
    super()

    // parse args
    let name: string|undefined, $ifNotExists: boolean|undefined
    if (typeof args[0] === 'object') {
      const json = args[0] as Partial<ICreateJQL>
      name = json.name
      $ifNotExists = json.$ifNotExists
    }
    else {
      name = args[0]
      $ifNotExists = args[1]
    }

    // check args
    if (!name) throw new SyntaxError('Missing name')
    if (typeof name !== 'string') throw new SyntaxError(`Invalid name ${name}`)

    // set args
    this.name = name
    this.$ifNotExists = $ifNotExists || false
  }

  // @override
  get [Symbol.toStringTag](): string {
    return this.classname
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toJson(): ICreateJQL {
    const result = { classname: this.classname, name: this.name } as ICreateJQL
    if (this.$ifNotExists) result.$ifNotExists = true
    return result
  }
}
