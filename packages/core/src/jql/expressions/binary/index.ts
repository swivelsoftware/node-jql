import format from 'string-format'
import { ConditionalExpression, Expression } from '..'
import { ColumnExpression } from '../column'
import { IExpression } from '../index.if'
import { parse, register } from '../parse'
import { QueryExpression } from '../query'
import { Unknown } from '../unknown'
import { BinaryOperator, IBinaryExpression } from './index.if'

const SIMPLE_OPERATOR: BinaryOperator[] = ['=', '<>', '<', '<=', '>', '>=']

/**
 * {left} {$not} {operator} {right}
 */
export class BinaryExpression extends ConditionalExpression implements IBinaryExpression {
  // @override
  public readonly classname = BinaryExpression.name

  // @override
  public left: Expression = new Unknown()

  // @override
  public operator: BinaryOperator = '='

  // @override
  public $not = false

  // @override
  public right: Expression = new Unknown()

  constructor(json?: IBinaryExpression) {
    super()

    // parse
    if (json) {
      this
        .setLeft(json.left)
        .setOperator(json.operator)
        .setNot(json.$not)
        .setRight(json.right)
    }
  }

  /**
   * set LEFT expression
   * @param expr [IExpression]
   */
  public setLeft(expr?: IExpression): BinaryExpression {
    this.left = expr ? parse(expr) : new Unknown()
    return this
  }

  /**
   * set binary operator
   * @param operator [BinaryOperator]
   */
  public setOperator(operator: BinaryOperator): BinaryExpression {
    if (SIMPLE_OPERATOR.indexOf(this.operator = operator) > -1) {
      this.$not = false
    }
    return this
  }

  /**
   * set NOT flag
   * @param expr [IExpression]
   */
  public setNot(flag = true): BinaryExpression {
    if ((this.$not = flag) && SIMPLE_OPERATOR.indexOf(this.operator) > -1) {
      this.$not = false
      throw new SyntaxError(`NOT flag cannot be applied to operator ${this.operator}`)
    }
    return this
  }

  /**
   * set RIGHT expression
   * @param expr [IExpression]
   */
  public setRight(expr?: IExpression): BinaryExpression {
    const expr_ = expr ? parse(expr) : new Unknown()
    if (expr_ instanceof QueryExpression) {
      if (expr_.query.$select.length !== 1 || (expr_.query.$select[0].expression instanceof ColumnExpression && expr_.query.$select[0].expression.isWildcard)) {
        throw new SyntaxError('Operand in Query format should return 1 column only')
      }
    }
    this.right = expr_
    return this
  }

  // @override
  public toJson(): IBinaryExpression {
    return {
      classname: this.classname,
      left: this.left.toJson(),
      $not: this.$not,
      operator: this.operator,
      right: this.right.toJson(),
    }
  }

  // @override
  public toString(): string {
    if (SIMPLE_OPERATOR.indexOf(this.operator) > -1) {
      return format('{0} {1} {2}',
        this.left.toString(),
        this.operator,
        this.right.toString(),
      )
    }
    else {
      return format(this.$not ? this.operator === 'IS' ? '{0} {1} NOT {2}' : '{0} NOT {1} {2}' : '{0} {1} {2}',
        this.left.toString(),
        this.operator,
        this.right.toString(),
      )
    }
  }
}

register(BinaryExpression)
