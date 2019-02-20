import { JQLError } from '../../utils/error'
import { Row } from '../interface'
import { Table } from '../schema/table'
import { ILimit } from '../sql/query/interface'
import { ICursor } from './interface'

/**
 * intermediate result set for processing query
 * 1) do GROUP BY ...
 * 2) do LIMIT ... OFFSET ...
 */
export class IntermediateResultSet extends Array<Row> {
  public set(symbol: symbol, value: any) {
    this[this.length - 1][symbol] = value
  }

  public nextRow() {
    this.push({})
  }

  public commit(metadata: Table, limit: ILimit = { value: Number.MAX_SAFE_INTEGER }): ResultSet {
    const result = new ResultSet(metadata)
    const offset = limit.$offset || 0
    for (let i = 0, row = this[offset + i]; i < Math.min(limit.value, this.length); i += 1, row = this[offset + i]) {
      const commitedRow = {} as Row
      for (const { symbol } of metadata.columns) {
        commitedRow[symbol] = row[symbol]
      }
      result.push(row)
    }
    return result
  }
}

/**
 * result set of query
 * access in 1) ICursor mode, or 2) Array mode
 */
export class ResultSet extends Array<Row> implements ICursor {
  private currentIndex: number = -1

  constructor(readonly metadata: Table, ...args: any[]) {
    super(...args)
    return new Proxy(this, {
      get(target, p): any {
        if (typeof p === 'number') {
          if (p < 0 || p >= target.length) throw new JQLError(`Array index out of bound: ResultSet does not have row[${p}]`)
        }
        return target[p]
      },
    })
  }

  public get(p: string|number|symbol): any {
    if (this.currentIndex === -1) throw new JQLError('The Cursor is pointed to -1. Call next() to move it to head')
    else if (this.currentIndex === this.length) throw new JQLError('The Cursor has reached the end')

    if (typeof p === 'string') {
      const name = p
      p = this.metadata.columns.findIndex((column) => column.name === name)
      if (p === -1) throw new JQLError(`Unknown column '${name}'`)
    }
    if (typeof p === 'number') {
      p = this.metadata.columns[p].symbol
    }
    return this[this.currentIndex][p]
  }

  public jumpTo(index: number): ResultSet {
    this.currentIndex = Math.max(-1, Math.min(this.length, index))
    return this
  }

  public next(): boolean {
    try {
      this.jumpTo(this.currentIndex + 1)
      return true
    }
    catch (e) {
      return false
    }
  }
}
