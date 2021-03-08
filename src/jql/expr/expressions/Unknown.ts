import squel from 'squel'
import { Type } from '../../../Type'
import { checkNull } from '../../../utils/check'
import { Expression } from '..'
import { IUnknown, IValue } from '../interface'

/**
 * JQL class for unknowns
 */
export class Unknown extends Expression implements IUnknown {
  public readonly classname = Unknown.name
  public type: Type[] = ['any']
  public value?: any

  /**
   * @param json [Partial<IUnknown>] optional
   */
  constructor(json?: Partial<IUnknown>)

  /**
   * @param types [Array<Type>] optional
   */
  constructor(...types: Type[])

  constructor(...args: any[]) {
    super()

    // parse args
    let types: Type[]
    if (args.length === 0) {
      types = ['any']
    }
    else if (args.length === 1 && typeof args[0] === 'object') {
      const json = args[0] as IUnknown
      json.type = json.type || 'any'
      types = Array.isArray(json.type) ? json.type : [json.type]
      if (json['value'] !== undefined) this.value = json['value']
    }
    else {
      types = args
    }

    // set args
    this.type = types
  }

  /**
   * Whether a value is assigned to this unknown
   */
  get assigned(): boolean {
    return !checkNull(this.value)
  }

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(type: squel.Flavour = 'mysql'): squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    if (Array.isArray(this.value)) {
      let format = ''
      for (let i = 0, length = this.value.length; i < length; i += 1) format += (i > 0 ? ', ' : '') + '?'
      format = `(${format})`
      return squel_.rstr(format, ...this.value)
    }
    return squel_.rstr('?', this.value)
  }

  // @override
  public toJson(): IValue|IUnknown {
    if (this.assigned) {
      return {
        classname: 'Value',
        value: this.value,
      }
    }
    return {
      classname: this.classname,
      type: this.type,
    }
  }
}
