import squel from 'squel'
import { DropJQL } from '.'
import { IDropDatabaseJQL } from './interface'

/**
 * JQL class for `DROP DATABASE ...`
 */
export class DropDatabaseJQL extends DropJQL implements IDropDatabaseJQL {
  public readonly classname = DropDatabaseJQL.name

  // @override
  public validate(): void { /* do nothing */ }

  // @override
  public toSquel(): squel.QueryBuilder {
    const builder = squel['dropDatabase']() as squel.QueryBuilder
    if (this.$ifExists) builder['ifExists']()
    builder['database'](this.name)
    return builder
  }
}
