import squel from 'squel'
import { Expression, IExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
import { parse } from './parse'
import { Unknown } from './unknown'

export type MathOperator = '+'|'-'|'*'|'/'|'%'|'MOD'|'DIV'

export interface IMathExpression extends IExpression {
  left: any
  operator: MathOperator
  right?: any
}

export class MathExpression extends Expression implements IMathExpression {
  public readonly classname = 'MathExpression'
  public left: Expression
  public operator: MathOperator
  public right: Expression

  constructor(json: IMathExpression) {
    super()
    try {
      this.left = parse(json.left)
      this.operator = json.operator
      this.right = parse(json.right)
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate MathExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'MathExpression'
  }

  get template(): string {
    return `(? ${this.operator} ?)`
  }

  // @override
  public validate(availableTables: string[]) {
    this.left.validate(availableTables)
    this.right.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr(
      this.template,
      this.left.toSquel(),
      this.right.toSquel(),
    )
  }

  // @override
  public toJson(): IMathExpression {
    const result: IMathExpression = {
      classname: this.classname,
      left: this.left.toJson(),
      operator: this.operator,
    }
    if (!(this.right instanceof Unknown) || this.right.value) result.right = this.right.toJson()
    return result
  }
}
