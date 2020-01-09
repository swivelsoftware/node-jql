import { CreateTable } from '@node-jql/sql-builder'
import { app, engines } from '../../../app'
import { IJQLOptions } from '../../../index.if'

/**
 * Enhanced CREATE TABLE
 */
export class CreateTableJQL extends CreateTable {
  public readonly schema: string
  public readonly engine: string

  constructor(sql: CreateTable, options: IJQLOptions) {
    super(sql)
    const schema = sql.database || options.schema
    if (!schema) throw new SyntaxError('No default schema is selected')
    this.schema = schema
    const option = sql.options.find(o => {
      let [name, value] = o.split('=')
      if (!value) return false
      name = name.trim()
      return name.toLocaleUpperCase() === 'ENGINE'
    })
    const engine = (option ? option.split('=')[1].trim() : undefined) || options.engine || app.options.defaultEngine || 'MemoryEngine'
    if (!engines[engine]) throw new SyntaxError(`Unknown engine '${engine}'`)
    this.engine = engine
  }
}
