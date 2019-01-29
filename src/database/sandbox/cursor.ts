export interface ICursor {
  count(): number
  get<T>(p: string|number|symbol): T
  next(): boolean
  reachEnd(): boolean
}
