import { JQLError } from '../../utils/error'
import { Row } from '../interface'
import { BindedColumn } from '../schema/column'
import { RealTable } from '../schema/table'
import { CompiledTableOrSubquery } from '../sql/query/tableOrSubquery'
import { CompiledJoinedTableOrSubquery } from '../sql/query/tableOrSubquery/joined'
import { Sandbox } from '../transaction'
import { ICursor } from './interface'

/**
 * representing the table in a FROM statement
 * handle JOIN clauses
 */
export class TableCursor implements ICursor {
  private currentIndex: number = -1
  private readonly tables: RealTable[]

  // cache the computed current row
  private cacheIndex?: number
  private cacheIndices?: number[]
  private cacheRow?: Row

  constructor(private readonly sandbox: Sandbox, private readonly tableOrSubquery: CompiledTableOrSubquery) {
    const tables: RealTable[] = this.tables = [tableOrSubquery.compiledSchema]
    if (tableOrSubquery instanceof CompiledJoinedTableOrSubquery) {
      tables.push(...tableOrSubquery.joinClauses.map((joinCaluse) => joinCaluse.tableOrSubquery.compiledSchema))
    }
  }

  // this is only possible maximum length, not the actual length
  private get length(): number {
    let length = 0
    length += this.tableOrSubquery.compiledSchema.count
    if (this.tableOrSubquery instanceof CompiledJoinedTableOrSubquery) {
      for (const { tableOrSubquery } of this.tableOrSubquery.joinClauses) {
        length += tableOrSubquery.compiledSchema.count
      }
    }
    return length
  }

  private get indices(): number[] {
    // cached computed indices
    if (this.cacheIndex === this.currentIndex && this.cacheIndices) {
      return this.cacheIndices
    }

    // compute the indices for the involved tables
    this.cacheIndex = this.currentIndex
    const indices: number[] = this.cacheIndices = []
    for (let i = this.tables.length - 1, base = 1; i >= 0; i -= 1) {
      const count = this.tables[i].count
      indices[i] = Math.floor(this.currentIndex / base) % count
      base *= count
    }
    return indices
  }

  private get currentRow(): Row {
    // cached computed row
    if (this.cacheIndex === this.currentIndex && this.cacheRow) {
      return this.cacheRow
    }

    // compute the full row
    const indices = this.indices
    const row = this.cacheRow = {} as Row
    for (let i = 0, length = this.tables.length; i < length; i += 1) {
      const table = this.tables[i]
      const index = indices[i]
      Object.assign(row, table.getRow(this.sandbox, index))
    }
    return row
  }

  public reachEnd(): boolean {
    return this.currentIndex === this.length
  }

  public get(p: string|number|symbol): any {
    if (this.currentIndex === -1) throw new JQLError('The Cursor is pointed to -1. Call next() to move it to head')
    else if (this.currentIndex === this.length) throw new JQLError('The Cursor has reached the end')

    if (typeof p === 'string') {
      const name = p
      const columns = this.tables.reduce<BindedColumn[]>((result, table) => {
        const column = table.columns.find((column) => column.name === name)
        if (column && result.length) throw new JQLError(`Ambiguous column '${name}'`)
        else if (column) result.push(column)
        return result
      }, [])
      if (!columns.length) throw new JQLError(`Unknown column '${p}'`)
      p = columns[0].symbol
    }
    if (typeof p === 'number') {
      for (const table of this.tables) {
        if (p >= table.columns.length) {
          p -= table.columns.length
        }
        else {
          p = table.columns[p].symbol
          break
        }
      }
    }
    return this.currentRow[p]
  }

  public moveToFirst(): boolean {
    this.currentIndex = -1
    return this.next()
  }

  public next(): boolean {
    const index = this.currentIndex + 1
    this.currentIndex = Math.max(-1, Math.min(this.length, index))
    if (index < 0 || index >= this.length) return false

    // remove caches
    delete this.cacheIndex
    delete this.cacheIndices
    delete this.cacheRow

    // evaluate if row is valid
    if (this.tableOrSubquery instanceof CompiledJoinedTableOrSubquery) {
      return this.tableOrSubquery.joinClauses.reduce((result, joinClause) => result || !joinClause.$on || joinClause.$on.evaluate(this.sandbox, this), false) || this.next()
    }

    return true
  }
}

/**
 * representing the FROM statement
 * cross join all the TableCursors
 */
export class FromCursor implements ICursor {
  private moveToFirst_: boolean = false

  constructor(private readonly tableCursors: TableCursor[]) {
  }

  public reachEnd(): boolean {
    return this.tableCursors.reduce((result, cursor) => result && cursor.reachEnd(), true)
  }

  public get(p: string|number|symbol): any {
    if (!this.moveToFirst_) throw new JQLError('The Cursor is pointed to -1. Call next() to move it to head')
    else if (this.reachEnd()) throw new JQLError('The Cursor has reached the end')

    const errors: Error[] = []
    for (const cursor of this.tableCursors) {
      try {
        return cursor.get(p)
      }
      catch (e) {
        errors.push(e)
      }
    }
    throw errors[0]
  }

  public next(): boolean {
    if (!this.moveToFirst_) {
      this.moveToFirst_ = true
      for (const cursor of this.tableCursors) {
        if (!cursor.moveToFirst()) return false
      }
      return true
    }

    let i = this.tableCursors.length - 1
    while (!this.tableCursors[i].next()) {
      if (i === 0) return false
      this.tableCursors[i--].moveToFirst()
    }

    return true
  }
}
