import { CreateTable } from '@node-jql/sql-builder'
import { app } from './app'
import { IJQLOptions } from './index.if'

/**
 * Get the targeted schema
 * @param sql [ISQL with schema]
 * @param options [IJQLOptions]
 */
export function getSchema(sql: { schema?: string }, options: IJQLOptions): string {
  const schema = sql.schema || options.schema
  if (!schema) throw new SyntaxError('No schema is selected')
  return schema
}

/**
 * Get the targeted engine
 * @param sql [CreateTable]
 * @param options [IJQLOptions]
 */
export function getEngine(sql: CreateTable, options: IJQLOptions): string {
  const option = sql.options.find(o => {
    let [name, value] = o.split('=')
    if (!value) return false
    name = name.trim()
    return name.toLocaleUpperCase() === 'ENGINE'
  })
  return (option ? option.split('=')[1].trim() : undefined) || options.engine || app.options.defaultEngine || 'MemoryEngine'
}

/**
 * Let the current task to sleep temporarily, in order to run another task first
 * until the next turn for the current task
 * @param ms [number]
 */
export function sleep(ms: number = 1): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
