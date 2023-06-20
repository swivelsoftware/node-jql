import squel from 'squel'
import { IRaw } from '../interface'
import { Raw } from './Raw'

/**
 * JQL class defining keyword
 */
export class Keyword extends Raw {
  classname = Keyword.name

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    return squel_.rstr(this.sql.toLocaleUpperCase())
  }
}