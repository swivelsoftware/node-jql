import { CreateTable, DropTable } from '@node-jql/sql-builder'
import { IUpdateResult } from '../index.if'
import { PromiseTask, Task } from '../task'
import { Context, DirtyContext, getContext } from './context'
import { TableLock } from './lock'
import { Table } from './table'

/**
 * Sandbox for handling changes
 */
export class Sandbox {
  private readonly globalContext: Context = getContext('global')
  private readonly sessionContext: Context
  private readonly dirtyGlobalContext: DirtyContext
  private readonly dirtySessionContext: DirtyContext
  private readonly writeLocks: TableLock[] = []
  private committed: boolean = false

  constructor(private readonly sessionId: string, public readonly autocommit: boolean = false) {
    this.sessionContext = getContext('session', sessionId)
    this.dirtyGlobalContext = new DirtyContext(sessionId)
    this.dirtySessionContext = new DirtyContext(sessionId)
  }

  /**
   * Check whether changes are committed
   */
  get isCommitted(): boolean {
    return this.committed
  }

  /**
   * CREATE TABLE
   * @param sql [CreateTable]
   */
  public createTable(sql: CreateTable): Task<Partial<IUpdateResult>> {
    return new PromiseTask<Partial<IUpdateResult>>(async task => {
      const { temporary, name, ifNotExists } = sql
      const schema = sql.schema as string

      // check if schema exists
      const readContext = new Context(true).merge(this.globalContext, this.dirtyGlobalContext, this.sessionContext, this.dirtySessionContext)
      if (!readContext.hasSchema(schema)) {
        this.dirtySessionContext.createSchema(schema)
        this.dirtyGlobalContext.createSchema(schema)
      }

      // create table
      const writeContext = temporary ? this.dirtySessionContext : this.dirtyGlobalContext
      const table = new Table(sql)
      if (readContext.hasTable(table.schema, table.name)) {
        if (ifNotExists) return { rowsAffected: 0 }
        throw new Error(`Table '${name}' already exists`)
      }
      else {
        writeContext.createTable(new Table(sql))
        if (this.autocommit) this.commit()
        return { rowsAffected: 1 }
      }
    })
  }

  /**
   * DROP TABLE
   * @param sql [DropTable]
   */
  public dropTable(sql: DropTable): Task<Partial<IUpdateResult>> {
    return new PromiseTask<Partial<IUpdateResult>>(async task => {
      const { name, ifExists } = sql
      const schema = sql.schema as string
      const isNormalTable = this.globalContext.hasTable(schema, name)
      const isTempTable = this.sessionContext.hasTable(schema, name)

      const readContext = new Context(true).merge(this.globalContext, this.dirtyGlobalContext, this.sessionContext, this.dirtySessionContext)
      const lock = readContext.getLock(schema, name)
      if (!isNormalTable && !isTempTable) {
        if (ifExists) return { rowsAffected: 0 }
        throw new Error(`Table '${name}' does not exist`)
      }
      else {
        await lock.close(this.sessionId)
        const writeContext = isTempTable ? this.dirtySessionContext : this.dirtyGlobalContext
        writeContext.dropTable(schema, name)
        if (this.autocommit) this.commit()
        return { rowsAffected: 1 }
      }
    })
  }

  /**
   * Commit changes
   */
  public commit() {
    this.dirtyGlobalContext.applyTo(this.globalContext)
    this.dirtySessionContext.applyTo(this.sessionContext)
    for (const lock of this.writeLocks) lock.releaseWrite(this.sessionId)
  }
}
