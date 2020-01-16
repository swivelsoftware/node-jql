import { CreateFunction, CreateTable, DropFunction, DropTable, Insert, Type } from '@node-jql/sql-builder'
import { Engine } from '../engine'
import { IUpdateResult } from '../index.if'
import { PromiseTask, Task } from '../task'
import { getContext } from './context'
import { CreateFunctionJQL } from './jql/create/function'
import { Sandbox } from './sandbox'

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
    getContext('session', sessionId, 'create')
  }

  // @override
  public async killSession(sessionId: string) {
    getContext('session', sessionId, 'delete')
  }

  // @override
  public createTable(sql: CreateTable, sessionId: string): Task<Partial<IUpdateResult>> {
    return new Sandbox(sessionId, true).createTable(sql)
  }

  // @override
  public createFunction(sql: CreateFunction): Task<Partial<IUpdateResult>> {
    return new PromiseTask<Partial<IUpdateResult>>(async task => {
      const jql = new CreateFunctionJQL(sql)
      getContext('global').createFunction(jql)
      return { rowsAffected: 1 }
    })
  }

  // @override
  public dropFunction(sql: DropFunction): Task<Partial<IUpdateResult>> {
    return new PromiseTask<Partial<IUpdateResult>>(async task => {
      getContext('global').dropFunction(sql.name)
      return { rowsAffected: 1 }
    })
  }

  // @override
  public dropTable(sql: DropTable, sessionId: string): Task<Partial<IUpdateResult>> {
    return new Sandbox(sessionId, true).dropTable(sql)
  }

  // @override
  public insert(sql: Insert): Task<Partial<IUpdateResult>> {
    // TODO
    throw new Error('Not implemented')
  }

  // @override
  public async dropSchema(name: string, sessionId: string) {
    const readonlyContext = getContext('readonly', sessionId)
    const tables = Object.keys(readonlyContext.tables[name])
    Promise.all(tables.map(table => readonlyContext.getLock(name, table).close(sessionId)))
    getContext('session', sessionId).dropSchema(name)
    getContext('global').dropSchema(name)
  }

  // @override
  protected async createSchema(name: string, sessionId: string) {
    getContext('global').createSchema(name)
    getContext('session', sessionId).createSchema(name)
  }
}
