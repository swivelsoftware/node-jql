import squel from 'squel'
import { DropJQL, IDropJQL } from '.'
import { JQLError } from '../../utils/error'

/**
 * Raw JQL for `DROP FUNCTION ...`
 */
export interface IDropFunctionJQL extends IDropJQL {
}

/**
 * JQL class for `DROP FUNCTION ...`
 */
export class DropFunctionJQL extends DropJQL implements IDropFunctionJQL {
  public readonly classname = DropFunctionJQL.name

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.QueryBuilder {
    throw new JQLError('DROP FUNCTION JQL cannot be converted to SQL format')
  }
}
