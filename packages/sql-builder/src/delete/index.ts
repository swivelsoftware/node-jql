import _ = require('lodash')
import { stringify } from '../dbType/stringify'
import { Expression } from '../expression'
import { GroupExpression } from '../expression/group'
import { IGroupExpression } from '../expression/index.if'
import { IBuilder, IExpression, IStringify } from '../index.if'
import { parse, register } from '../parse'
import { IDelete } from './index.if'

class Builder implements IBuilder<Delete> {
  private readonly json: IDelete

  constructor(name: string) {
    this.json = {
      classname: Delete.name,
      name,
    }
  }

  /**
   * Set `schema` for the table
   * @param schema [string]
   */
  public schema(schema: string): Builder {
    this.json.schema = schema
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
  public build(): Delete {
    return new Delete(this.json)
  }

  // @override
  public toJson(): IDelete {
    return _.cloneDeep(this.json)
  }
}

/**
 * DELETE FROM
 */
export class Delete implements IDelete, IStringify {
  public static Builder = Builder

  public readonly classname = Delete.name
  public readonly schema?: string
  public readonly name: string
  public readonly where?: Expression

  constructor(json: string|IDelete) {
    if (typeof json === 'string') {
      this.name = json
    }
    else {
      this.schema = json.schema
      this.name = json.name
      if (json.where) this.where = parse<Expression>(json.where)
    }
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IDelete {
    const json: IDelete = {
      classname: this.classname,
      name: this.name,
    }
    if (this.schema) json.schema = this.schema
    if (this.where) json.where = this.where.toJson()
    return json
  }
}

register(Delete)
