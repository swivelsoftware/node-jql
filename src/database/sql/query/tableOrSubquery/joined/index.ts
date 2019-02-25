import { CompiledTableOrSubquery, TableOrSubquery } from '..'
import { JQLError } from '../../../../../utils/error'
import { TemporaryTable } from '../../../../schema/table'
import { Transaction } from '../../../../transaction'
import { ICompileSqlOptions } from '../../../interface'
import { IJoinedTableOrSubquery } from '../interface'
import { CompiledJoinClause, JoinClause } from './join'

/**
 * expression `FROM ... JOIN ... ON ...`
 */
export class JoinedTableOrSubquery extends TableOrSubquery implements IJoinedTableOrSubquery {
  public joinClauses: JoinClause[] = []

  constructor(json: IJoinedTableOrSubquery) {
    super(json)
    try {
      let joinClauses = json.joinClauses
      if (!Array.isArray(joinClauses)) joinClauses = [joinClauses]
      this.joinClauses = joinClauses.map((joinClause) => new JoinClause(this, joinClause))
    }
    catch (e) {
      throw new JQLError('Fail to instantiate JoinedTableOrSubquery', e)
    }
  }

  // @override
  public validate(tables: string[] = []): string[] {
    tables = super.validate(tables)
    for (const joinClause of this.joinClauses) {
      tables = joinClause.tableOrSubquery.validate(tables)
    }
    // TODO validate $on
    return tables
  }
}

/**
 * compiled `JoinedTableOrSubquery`
 */
export class CompiledJoinedTableOrSubquery extends CompiledTableOrSubquery {
  public readonly joinClauses: CompiledJoinClause[]

  constructor(transaction: Transaction, options: ICompileSqlOptions<JoinedTableOrSubquery>) {
    super(transaction, options)
    try {
      this.joinClauses = options.parent.joinClauses.map((joinClause) => new CompiledJoinClause(transaction, joinClause, this.compiledSchema, options))
    }
    catch (e) {
      throw new JQLError('Fail to compile JoinedTableOrSubquery', e)
    }
  }
}
