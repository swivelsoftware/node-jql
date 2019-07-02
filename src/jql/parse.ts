import { IJQL, JQL } from '.'
import { CreateJQL, ICreateJQL } from './create'
import { CreateDatabaseJQL, ICreateDatabaseJQL } from './create/database'
import { CreateTableJQL, ICreateTableJQL } from './create/table'
import { DropJQL, IDropJQL } from './drop'
import { DropDatabaseJQL, IDropDatabaseJQL } from './drop/database'
import { DropTableJQL, IDropTableJQL } from './drop/table'
import { IQuery, Query } from './query'

/**
 * Parsealble JQL
 */
export interface IParseable {
  /**
   * The JQL class name
   */
  classname: string
}

/**
 * Check whether the JQL is parseable
 * @param jql [IJQL]
 */
export function isParseable(jql: IJQL): jql is IParseable {
  return 'classname' in jql && typeof jql['classname'] === 'string' && [
    'CreateDatabaseJQL',
    'CreateTableJQL',
    'DropDatabaseJQL',
    'DropTableJQL',
    // TODO
    'Query',
  ].indexOf(jql['classname']) > -1
}

/**
 * Parse JQL raw json to class instance
 * @param json [IParseable]
 */
export function parse<T extends CreateJQL>(json: ICreateJQL): T
export function parse<T extends DropJQL>(json: IDropJQL): T
export function parse(json: IQuery): Query
export function parse(json: IParseable): JQL
export function parse(json: IParseable): JQL {
  if (!json.classname) throw new SyntaxError('Unknown expression: classname not defined')
  switch (json.classname) {
    case CreateDatabaseJQL.name:
      return new CreateDatabaseJQL(json as ICreateDatabaseJQL)
    case CreateTableJQL.name:
      return new CreateTableJQL(json as ICreateTableJQL)
    case DropDatabaseJQL.name:
      return new DropDatabaseJQL(json as IDropDatabaseJQL)
    case DropTableJQL.name:
      return new DropTableJQL(json as IDropTableJQL)
    // TODO
    case Query.name:
      return new Query(json as IQuery)
    default:
      throw new SyntaxError(`Unknown JQL: classname ${json.classname} not found`)
  }
}
