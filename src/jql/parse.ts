import { IParseable, Jql } from '.'
import { CreateJql, ICreateJql } from './create'
import { CreateDatabaseJQL, ICreateDatabaseJQL } from './create/database'
import { CreateTableJQL, ICreateTableJQL } from './create/table'

export function parse<T extends CreateJql>(json: ICreateJql): T

/**
 * Parse JQL raw json to class instance
 * @param json [ICreateJql]
 */
export function parse(json: IParseable): Jql {
  if (!json.classname) throw new SyntaxError('Unknown expression: classname not defined')
  switch (json.classname) {
    case CreateDatabaseJQL.name:
      return new CreateDatabaseJQL(json as ICreateDatabaseJQL)
    case CreateTableJQL.name:
      return new CreateTableJQL(json as ICreateTableJQL)
    default:
      throw new SyntaxError(`Unknown JQL: classname ${json.classname} not found`)
  }
}
