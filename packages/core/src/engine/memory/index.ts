import { DatabaseEngine } from '..'
import { JQL } from '../../jql'
import { CreateFunctionJQL } from '../../jql/create/function'
import { CreateSchemaTableJQL } from '../../jql/create/table'
import { DeleteJQL } from '../../jql/delete'
import { DropFunctionJQL } from '../../jql/drop/function'
import { DropTableJQL } from '../../jql/drop/table'
import { InsertJQL } from '../../jql/insert'
import { Query } from '../../jql/select'
import { SetVariableJQL } from '../../jql/set'
import { Context } from './context'
import { IEngineOptions } from './options'

/**
 * In-memory SQL database engine
 */
export class MemoryDatabaseEngine extends DatabaseEngine {
  /**
   * Engine context
   */
  protected readonly context = new Context()

  constructor(
    /**
     * Schema options
     */
    protected readonly options: IEngineOptions = {},
  ) {
    super()
  }

  // @override
  public async query<T>(tid: string, query: Query): Promise<T> {
    // TODO
    throw new Error('Not Implemented')
  }

  // @override
  public async update(tid: string, jql: JQL): Promise<number> {
    if (jql instanceof Query) {
      throw new Error('Use query(Query) function instead')
    }
    else if (jql instanceof CreateSchemaTableJQL) {
      // TODO
    }
    else if (jql instanceof CreateFunctionJQL) {
      // TODO
    }
    else if (jql instanceof DeleteJQL) {
      // TODO
    }
    else if (jql instanceof DropTableJQL) {
      // TODO
    }
    else if (jql instanceof DropFunctionJQL) {
      // TODO
    }
    else if (jql instanceof InsertJQL) {
      // TODO
    }
    else if (jql instanceof SetVariableJQL) {
      // TODO
    }
    throw new Error(`Invalid jql used in update(jql): ${jql.toString()}`)
  }
}
