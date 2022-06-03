import squel from '@swivel-admin/squel'
import { Expression } from '..'
import { IRaw } from '../interface'

/**
 * JQL class defining raw SQL
 */
export class Raw extends Expression implements IRaw {
  classname = Raw.name
  sql: string

  /**
   * @param json [Partial<IRaw>]
   */
  constructor(json: Partial<IRaw>)

  /**
   * @param sql [string]
   */
  constructor(sql: string)
 
  constructor(...args: any[]) {
    super()

    if (typeof args[0] === 'string') {
      this.sql = args[0]
    }
    else {
      this.sql = args[0].sql
    }

    // check args
    if (!this.sql) throw new SyntaxError('Missing SQL')
  }

  // @override
  public validate(availableTables: string[]): void {
    // do nothing
  }

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    return squel_.rstr(this.sql)
  }

  // @override
  public toJson(): IRaw {
    return {
      classname: this.classname,
      sql: this.sql
    }
  }
}