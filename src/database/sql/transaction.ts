import { Sql } from './index'

export class Transaction extends Sql {
  private readonly sqls: Sql[]

  constructor(...sqls: Sql[]) {
    super()
    this.sqls = sqls
  }

  public validate(): boolean {
    for (const sql of this.sqls) {
      if (!sql.validate()) return false
    }
    return true
  }
}
