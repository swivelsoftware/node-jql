// tslint:disable:no-eval

import squel = require('squel')
import { checkNull } from '../../../utils/check'
import { BinaryOperator, IRegexpExpression, IUnknown } from '../interface'
import { parseExpr } from '../parse'
import { BinaryExpression } from './BinaryExpression'
import { Unknown } from './Unknown'
import { Value } from './Value'

/**
 * JQL class for `{left} REGEXP {right}`
 */
export class RegexpExpression extends BinaryExpression implements IRegexpExpression {
  public readonly classname = RegexpExpression.name
  public readonly operator: BinaryOperator = 'REGEXP'
  public right: Unknown|Value

  /**
   * @param json [Partial<IRegexpExpression>]
   */
  constructor(json: Partial<IRegexpExpression>)

  /**
   * @param left [any]
   * @param $not [boolean]
   * @param right [IUnknown|RegExp|string] optional
   */
  constructor(left: any, $not: boolean, right?: IUnknown|RegExp|string)

  constructor(...args: any[]) {
    super(args.length > 1 ? { left: args[0], operator: 'REGEXP', right: args[2] } : args[0], true)

    // parse args
    let $not = false, right: IUnknown|RegExp|string|undefined
    if (args.length === 1) {
      const json = args[0] as IRegexpExpression
      $not = json.$not || false
      right = json.right
    }
    else {
      $not = args[1]
      right = args[2]
    }

    // convert string to regexp
    if (typeof right === 'string' && right.length > 2 && right.startsWith('/') && right.indexOf('/', 2) > -1) {
      right = eval(right) as RegExp
    }

    // set args
    this.$not = $not
    this.right = parseExpr(right)
  }

  // @override
  public toSquel(): squel.BaseBuilder {
    if (this.right instanceof Value) {
      if (this.right.value instanceof RegExp && this.right.value.flags) {
        const regexp = this.right.value
        let flags = ''
        if (regexp.flags.indexOf('i') > -1) flags += 'i'
        if (regexp.flags.indexOf('m') > -1) flags += 'm'
        if (regexp.flags.indexOf('u') > -1) flags += 'u'
        if (flags.length && flags.indexOf('i') === -1) flags += 'c'
        return squel.rstr(
          flags ? `REGEXP_LIKE(?, ?, ?)` : `REGEXP_LIKE(?, ?)`,
          this.left.toSquel(),
          regexp.source,
          flags,
        )
      }
      // empty string -> illegal argument to a regular expression
      else if (typeof this.right.value === 'string' && !this.right.value.length) {
        return squel.expr().and('1 = 1')
      }
    }
    return super.toSquel()
  }

  // @override
  public toJson(): IRegexpExpression {
    const json = super.toJson() as IRegexpExpression
    if (!checkNull(json.right) && json.right instanceof RegExp) json.right = json.right.toString()
    return json
  }
}
