import { CreateFunction } from '@node-jql/sql-builder'

/**
 * Enhanced CREATE FUNCTION
 */
export class CreateFunctionJQL extends CreateFunction {
  public readonly function: Function

  constructor(sql: CreateFunction) {
    super(sql)
    this.function = new Function(...sql.parameters.map(p => p[0]), sql.code)
  }
}
