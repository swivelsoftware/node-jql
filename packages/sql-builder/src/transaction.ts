import { stringify } from './dbType/stringify'
import { ISQL, IStringify, ITransaction } from './index.if'
import { parse } from './parse'

/**
 * START TRANSACTION ... COMMIT
 */
export class Transaction implements ITransaction, IStringify {
  public readonly classname: string = Transaction.name

  public readonly sqls: Array<ISQL & IStringify>
  public readonly mode: 'writeonly'|'readonly'|'readwrite' = 'writeonly'

  constructor(json: ITransaction) {
    this.sqls = json.sqls.map(sql => parse(sql))
    if (json.mode) this.mode = json.mode
  }

  // @override
  public toString(): string {
    return stringify(Transaction.name, this)
  }

  // @override
  public toJson(): ITransaction {
    return {
      classname: this.classname,
      sqls: this.sqls.map(sql => sql.toJson()),
      mode: this.mode,
    }
  }
}
