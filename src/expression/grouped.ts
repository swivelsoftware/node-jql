import squel = require('squel')
import { ConditionalExpression, IConditionalExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
import { parse } from './parse'

export interface IGroupedExpressions extends IConditionalExpression {
  expressions: IConditionalExpression[]
}

export abstract class GroupedExpressions extends ConditionalExpression implements IGroupedExpressions {
  public readonly classname: string = 'GroupedExpressions'
  public expressions: ConditionalExpression[]

  constructor(json: IGroupedExpressions) {
    super()
    try {
      this.expressions = json.expressions.map(expression => parse(expression) as ConditionalExpression)
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate GroupedExpressions', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'GroupedExpressions'
  }

  // @override
  public validate(availableTables: string[]) {
    for (const expression of this.expressions) expression.validate(availableTables)
  }

  // @override
  public toJson(): IGroupedExpressions {
    return {
      classname: this.classname,
      expressions: this.expressions.map(expression => expression.toJson()),
    }
  }
}

export class AndExpressions extends GroupedExpressions {
  public readonly classname = 'AndExpressions'

  // @override
  get [Symbol.toStringTag]() {
    return 'AndExpressions'
  }

  // @override
  public toSquel(): squel.Expression {
    let result = squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel().toParam()
      result = result.and(text, ...values)
    }
    return result
  }
}

export class OrExpressions extends GroupedExpressions {
  public readonly classname = 'OrExpressions'

  // @override
  get [Symbol.toStringTag]() {
    return 'OrExpressions'
  }

  // @override
  public toSquel(): squel.Expression {
    let result = squel.expr()
    for (const expression of this.expressions) {
      const { text, values } = expression.toSquel().toParam()
      result = result.or(text, ...values)
    }
    return result
  }
}
