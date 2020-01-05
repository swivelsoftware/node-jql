import _ = require('lodash')
import { stringify } from '../dbType/stringify'
import { Expression } from '../expression'
import { BinaryExpression } from '../expression/binary'
import { GroupExpression } from '../expression/group'
import { IBinaryExpression, IGroupExpression } from '../expression/index.if'
import { IBuilder, IExpression, IStringify } from '../index.if'
import { parse } from '../parse'
import { IUpdate } from './index.if'

class Builder implements IBuilder<Update> {
  private json: IUpdate

  constructor(name: string) {
    this.json = {
      classname: Update.name,
      name,
      set: [],
    }
  }

  /**
   * Set `database` for the table
   * @param database [string]
   */
  public database(database: string): Builder {
    this.json.database = database
    return this
  }

  /**
   * Add value to be set
   * @param json [IBinaryExpression]
   */
  public set(json: IBinaryExpression): Builder {
    if (json.operator !== '=') throw new SyntaxError('You must use operator \'=\'')
    this.json.set.push(json)
    return this
  }

  /**
   * Add WHERE expression
   * @param expr [IExpression]
   */
  public where(expr: IExpression): Builder {
    if (this.json.where && this.json.where.classname === GroupExpression.name && (this.json.where as IGroupExpression).operator === 'AND') {
      (this.json.where as IGroupExpression).expressions.push(expr)
    }
    else if (this.json.where) {
      this.json.where = new GroupExpression.Builder('AND')
        .expr(this.json.where)
        .expr(expr)
        .toJson()
    }
    else {
      this.json.where = expr
    }
    return this
  }

  // @override
  public build(): Update {
    if (!this.json.set || !this.json.set.length) throw new SyntaxError('You must specify at least 1 value to be set')
    return new Update(this.json)
  }

  // @override
  public toJson(): IUpdate {
    return _.cloneDeep(this.json)
  }
}

/**
 * UPDATE SET
 */
export class Update implements IUpdate, IStringify {
  public static Builder = Builder

  public readonly classname: string = Update.name
  public readonly database?: string
  public readonly name: string
  public readonly set: BinaryExpression[]
  public readonly where?: Expression

  constructor(json: string|IUpdate) {
    if (typeof json === 'string') {
      this.name = json
    }
    else {
      this.database = json.database
      this.name = json.name
      this.set = json.set.map(json => new BinaryExpression(json))
      if (json.where) this.where = parse<Expression>(json.where)
    }
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IUpdate {
    const json: IUpdate = {
      classname: this.classname,
      name: this.name,
      set: this.set.map(expr => expr.toJson()),
    }
    if (this.database) json.database = this.database
    if (this.where) json.where = this.where.toJson()
    return json
  }
}
