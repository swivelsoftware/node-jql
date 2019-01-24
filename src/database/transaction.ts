import { Database } from "./index";
import { Sql, Query, Expression } from "./sql/index";

export class Transaction {
  public temp: any = {}

  constructor (private readonly database: Database) {
  }

  validate (...sqls: Sql[]): boolean {
    for (const sql of sqls) {
      if (sql instanceof Query) {
        // TODO check $select
        // TODO check $from
        // TODO check $join
        // TODO check $where
        // TODO check $group
        // TODO check $order
        // TODO check $limit
      }
      // TODO
    }
    return true
  }

  run<T> (...sqls: Sql[]): T {
    this.validate(...sqls)
    // TODO
    return {} as T
  }
}