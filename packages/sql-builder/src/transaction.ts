import _ = require('lodash')
import { CreateSchema } from './create/schema'
import { stringify } from './dbType/stringify'
import { DropSchema } from './drop/schema'
import { IBuilder, ISQL, IStringify, ITransaction } from './index.if'
import { parse } from './parse'

class Builder implements IBuilder<Transaction> {
  private readonly json: ITransaction = {
    classname: Transaction.name,
    sqls: [],
  }

  /**
   * Add SQL statement
   * @param sql [ISQL]
   */
  public sql(sql: ISQL): Builder {
    sql = parse(sql)
    if (sql instanceof CreateSchema || sql instanceof DropSchema) {
      throw new SyntaxError('You are not allowed to change a Schema within the Transaction')
    }
    this.json.sqls.push(sql)
    return this
  }

  /**
   * Set transaction mode
   * @param mode [string]
   */
  public mode(mode: 'writeonly'|'readonly'|'readwrite'): Builder {
    this.json.mode = mode
    return this
  }

  // @override
  public build(): Transaction {
    return new Transaction(this.json)
  }

  // @override
  public toJson(): ITransaction {
    return _.cloneDeep(this.json)
  }
}

/**
 * START TRANSACTION ... COMMIT
 */
export class Transaction implements ITransaction, IStringify {
  public static Builder = Builder

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
