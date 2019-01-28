export abstract class Sql {
  public abstract validate(): boolean
}

export { DefineStatement } from './define'
export { Query } from './query'

export * from './interface/expression/index'
export * from './interface/group-by'
export * from './interface/join-clause'
export * from './interface/limit'
export * from './interface/ordering-term'
export * from './interface/result-column'
export * from './interface/table-or-subquery'
