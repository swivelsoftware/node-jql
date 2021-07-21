import squel from 'squel'
import { Expression } from '..'
import { IKeyword } from '../interface'

/**
 * JQL class defining keyword
 */
export class Keyword extends Expression implements IKeyword {
  classname = Keyword.name
  keyword: string

  /**
   * @param json [Partial<IKeyword>]
   */
  constructor(json: Partial<IKeyword>)

  /**
   * @param keyword [string]
   */
  constructor(keyword: string)
 
  constructor(...args: any[]) {
    super()

    if (typeof args[0] === 'string') {
      this.keyword = args[0]
    }
    else {
      this.keyword = args[0].keyword
    }

    // check args
    if (!this.keyword) throw new SyntaxError('Missing keyword')
  }

  // @override
  public validate(availableTables: string[]): void {
    // do nothing
  }

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    return squel_.rstr(this.keyword.toLocaleUpperCase())
  }

  // @override
  public toJson(): IKeyword {
    return {
      classname: this.classname,
      keyword: this.keyword
    }
  }
}