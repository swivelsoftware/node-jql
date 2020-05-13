import { JQL } from '.'
import { CreateJQL } from './create'
import { CreateDatabaseJQL } from './create/database'
import { CreateFunctionJQL } from './create/function'
import { ICreateDatabaseJQL, ICreateFunctionJQL, ICreateJQL, ICreateTableJQL } from './create/interface'
import { CreateTableJQL } from './create/table'
import { DropJQL } from './drop'
import { DropDatabaseJQL } from './drop/database'
import { DropFunctionJQL } from './drop/function'
import { IDropDatabaseJQL, IDropFunctionJQL, IDropJQL, IDropTableJQL } from './drop/interface'
import { DropTableJQL } from './drop/table'
import { InsertJQL } from './insert'
import { IInsertJQL } from './insert/interface'
import { IJQL, IParseable } from './interface'
import { Query } from './query'
import { IQuery } from './query/interface'

/**
 * Check whether the JQL is parseable
 * @param jql [IJQL]
 */
export function isParseable(jql: IJQL): jql is IParseable {
  return 'classname' in jql && typeof jql['classname'] === 'string' && [
    CreateDatabaseJQL.name,
    CreateTableJQL.name,
    CreateFunctionJQL.name,
    DropDatabaseJQL.name,
    DropTableJQL.name,
    DropFunctionJQL.name,
    InsertJQL.name,
    // TODO
    Query.name,
  ].indexOf(jql['classname']) > -1
}

/**
 * Parse JQL raw json to class instance
 * @param json [IParseable]
 */
export function parseJQL<T extends CreateJQL>(json: ICreateJQL): T
export function parseJQL<T extends DropJQL>(json: IDropJQL): T
export function parseJQL(json: IInsertJQL): InsertJQL
export function parseJQL(json: IQuery): Query
export function parseJQL(json: IParseable): JQL
export function parseJQL(json: IParseable): JQL {
  if (!json.classname) throw new SyntaxError(`Unknown expression: classname not defined in ${JSON.stringify(json)}`)
  switch (json.classname) {
    case CreateDatabaseJQL.name:
      return new CreateDatabaseJQL(json as ICreateDatabaseJQL)
    case CreateTableJQL.name:
      return new CreateTableJQL(json as ICreateTableJQL)
    case CreateFunctionJQL.name:
      return new CreateFunctionJQL(json as ICreateFunctionJQL)
    case DropDatabaseJQL.name:
      return new DropDatabaseJQL(json as IDropDatabaseJQL)
    case DropTableJQL.name:
      return new DropTableJQL(json as IDropTableJQL)
    case DropFunctionJQL.name:
      return new DropFunctionJQL(json as IDropFunctionJQL)
    case InsertJQL.name:
      return new InsertJQL(json as IInsertJQL)
    // TODO
    case Query.name:
      return new Query(json as IQuery)
    default:
      throw new SyntaxError(`Unknown JQL: classname ${json.classname} not found`)
  }
}
