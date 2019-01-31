import { JQLError } from '../../utils/error'
import { Column } from '../metadata/column'
import { Table } from '../metadata/table'
import { ICursor } from './cursor'

export interface Index { column: Column, index: number }

export class ResultSet<T> extends Array<T> implements ICursor {
  private currentIndex = -1

  constructor(readonly metadata: Table, ...args: any[]) {
    super(...args)
    return new Proxy(this, {
      get(target, p) {
        if (typeof p === 'number') return undefined
        return target[p]
      },
      set(target, p, value): boolean {
        if (typeof p !== 'number') {
          target[p] = value
          return true
        }
        return false
      },
    })
  }

  public count(): number {
    return this.length
  }

  public columnIndexOf(name: string): Index[]|number {
    const index = this.metadata.columns.findIndex((column) => column.toString() === name)
    if (index > -1) return index

    const result = this.metadata.columns.reduce<Index[]>((result, column, index) => {
      if (column.name === name) result.push({ column, index })
      return result
    }, [])
    return result.length === 0 ? -1 : result.length === 1 ? result[0].index : result
  }

  public get<U = T>(p: number|symbol): U {
    if (this.currentIndex < 0) throw new JQLError('call cursor.next() first')
    if (this.reachEnd()) throw new JQLError('cursor reaches the end')
    if (typeof p === 'number') {
      const column = this.metadata.columns[p]
      if (!column) throw new JQLError(`column index out of bound: ${p}`)
      p = column.symbol
    }
    return this[this.currentIndex][p] as any
  }

  public next(): boolean {
    this.currentIndex += 1
    return this.reachEnd()
  }

  public reachEnd(): boolean {
    return this.currentIndex >= this.count()
  }
}
