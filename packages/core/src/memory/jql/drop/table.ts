import { DropTable } from '@node-jql/sql-builder'
import { IJQLOptions } from '../../../index.if'

/**
 * Enhanced DROP TABLE
 */
export class DropTableJQL extends DropTable {
  public readonly schema: string

  constructor(sql: DropTable, options: IJQLOptions) {
    super(sql)
    const schema = sql.database || options.schema
    if (!schema) throw new SyntaxError('No default schema is selected')
    this.schema = schema
  }
}
