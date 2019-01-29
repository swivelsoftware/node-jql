import { Table } from '../metadata/table'
import { ICursor } from './cursor'

export class ResultSet<T> extends Array<T> implements ICursor {
  private currentIndex = -1

  constructor(readonly table?: Table, ...args: any[]) {
    super(...args)
  }

  public count(): number {
    return this.length
  }

  public get<U = T>(p: string|number|symbol): U {
    if (this.currentIndex < 0) throw new Error('call cursor.next() first')
    if (this.reachEnd()) throw new Error('cursor reaches the end')
    return this[this.currentIndex] as any
  }

  public next(): boolean {
    this.currentIndex += 1
    return this.reachEnd()
  }

  public reachEnd(): boolean {
    return this.currentIndex >= this.count()
  }
}
