import squel from 'squel'
import { ConditionalExpression, Expression, IConditionalExpression } from '.'
import { IQuery, isQuery, Query } from '../query'
import { InstantiateError } from '../utils/error/InstantiateError'
import { ColumnExpression } from './column'
import { parse } from './parse'
import { IUnknown, Unknown } from './unknown'
import { IValue, Value } from './value'

export interface IInExpression extends IConditionalExpression {
  left: any
  $not?: boolean
  right?: IUnknown|any[]|IValue|IQuery
}

export class InExpression extends ConditionalExpression implements IInExpression {
  public readonly classname = 'InExpression'
  public left: Expression
  public $not?: boolean
  public right: Unknown|Value|Query

  constructor(json: IInExpression) {
    super()
    this.$not = json.$not
    try {
      this.left = parse(json.left)
      if (json.right) {
        if (isQuery(json.right)) {
          this.right = new Query(json.right)
          if (this.right.$select.length > 1 || (this.right.$select[0].expression instanceof ColumnExpression && this.right.$select[0].expression.isWildcard)) {
            throw new SyntaxError('InExpression.right should contain 1 column only')
          }
        }
        else {
          this.right = parse(json.right) as Unknown|Value
        }
      }
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate InExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'InExpression'
  }

  get template(): string {
    return `? ${this.$not ? 'NOT ' : ''}IN ${this.right instanceof Query ? '' : '('}?${this.right instanceof Query ? '' : ')'}`
  }

  // @override
  public validate(availableTables: string[]) {
    this.left.validate(availableTables)
    this.right.validate(availableTables)
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        this.template,
        this.left.toSquel(),
        this.right.toSquel(),
      )
  }

  // @override
  public toJson(): IInExpression {
    const result: IInExpression = {
      classname: this.classname,
      left: this.left.toJson(),
    }
    if (this.$not) result.$not = this.$not
    if (this.right) result.right = this.right.toJson()
    return result
  }
}
