import { CreateFunction, Type } from '@node-jql/sql-builder'
import { Engine } from '../engine'
import { IUpdateResult } from '../index.if'
import { PromiseTask, Task } from '../task'
import { DEFAULT_SESSION_ID, getContext } from './context'
import { CreateFunctionJQL } from './jql/create/function'
import { CreateTableJQL } from './jql/create/table'
import { DropTableJQL } from './jql/drop/table'
import { Table } from './table'

/**
 * Default value of the given type
 * @param type [string]
 */
export function getDefaultValue(type: Type): any {
  switch (type.toString()) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'undefined':
      return null
    case 'date':
      return Date.now()
    case 'object':
      return {}
    case 'array':
      return []
    default:
      throw new Error(`Unsupported type '${type}'`)
  }
}

/**
 * In-memory table engine
 */
export class MemoryEngine extends Engine {
  // @override
  public async createSession(sessionId: string) {
    getContext(sessionId, 'session', 'create')
  }

  // @override
  public async killSession(sessionId: string) {
    getContext(sessionId, 'session', 'delete')
  }

  // @override
  public createTable(jql: CreateTableJQL, sessionId: string): Task<Partial<IUpdateResult>> {
    return new PromiseTask<Partial<IUpdateResult>>(async task => {
      const { temporary, schema, name, ifNotExists } = jql
      let readContext = getContext(sessionId, 'readonly')
      const writeContext = getContext(sessionId, temporary ? 'session' : 'global')

      // check if schema exists
      if (!readContext.hasSchema(schema)) {
        await this.createSchema(schema, sessionId)
        readContext = getContext(sessionId, 'readonly')
      }

      const table = new Table(jql)
      if (writeContext.hasTable(table.schema, table.name)) {
        if (ifNotExists) return { rowsAffected: 0 }
        throw new Error(`Table '${name}' already exists`)
      }
      else {
        writeContext.createTable(new Table(jql))
        return { rowsAffected: 1 }
      }
    })
  }

  // @override
  public createFunction(sql: CreateFunction): Task<Partial<IUpdateResult>> {
    return new PromiseTask<Partial<IUpdateResult>>(async task => {
      const jql = new CreateFunctionJQL(sql)
      const writeContext = getContext(DEFAULT_SESSION_ID, 'global')
      writeContext.createFunction(jql)
      return { rowsAffected: 1 }
    })
  }

  // @override
  public dropTable(jql: DropTableJQL, sessionId: string): Task<Partial<IUpdateResult>> {
    return new PromiseTask<Partial<IUpdateResult>>(async task => {
      const { schema, name, ifExists } = jql
      const readonlyContext = getContext(sessionId, 'readonly')
      const lock = readonlyContext.getLock(schema, name)

      const globalContext = getContext(sessionId, 'global')
      const sessionContext = getContext(sessionId, 'session')
      const isNormalTable = globalContext.hasTable(schema, name)
      const isTempTable = sessionContext.hasTable(schema, name)

      if (!isNormalTable && !isTempTable) {
        if (ifExists) return { rowsAffected: 0 }
        throw new Error(`Table '${name}' does not exist`)
      }
      else {
        await lock.write(sessionId)
        const context = isTempTable ? sessionContext : globalContext
        context.dropTable(schema, name)
        lock.close()
        return { rowsAffected: 1 }
      }
    })
  }

  // @override
  public async dropSchema(name: string, sessionId: string) {
    const readonlyContext = getContext(sessionId, 'readonly')
    const tables = Object.keys(readonlyContext.tables[name])
    tables.map(table => readonlyContext.getLock(name, table).close())
    getContext(sessionId, 'session').dropSchema(name)
    getContext(sessionId, 'global').dropSchema(name)
  }

  // @override
  protected async createSchema(name: string, sessionId: string) {
    getContext(sessionId, 'global').createSchema(name)
    getContext(sessionId, 'session').createSchema(name)
  }
}
