export interface ICursor {
  // get the value of the given key from the current row
  get(p: string|number|symbol): any

  // move to next column. return false if reaches end
  next(): boolean
}
