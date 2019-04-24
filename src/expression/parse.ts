import { Expression } from '.'
import { getType } from '../Type'
import { JQLError } from '../utils/error'
import { BetweenExpression } from './between'
import { BinaryExpression } from './binary'
import { CaseExpression } from './case'
import { ColumnExpression } from './column'
import { ExistsExpression } from './exists'
import { FunctionExpression } from './function'
import { AndExpressions, OrExpressions } from './grouped'
import { InExpression } from './in'
import { IsNullExpression } from './isNull'
import { LikeExpression } from './like'
import { Unknown } from './unknown'
import { Value } from './value'

const expressions = {
  AndExpressions,
  BetweenExpression,
  BinaryExpression,
  CaseExpression,
  ColumnExpression,
  ExistsExpression,
  FunctionExpression,
  InExpression,
  IsNullExpression,
  LikeExpression,
  OrExpressions,
  Unknown,
  Value,
}

export function parse(value: any): Expression {
  if (value instanceof Expression) {
    return value
  }
  else if (value === undefined) {
    return new Unknown()
  }
  else if (typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
    if (!value.classname) throw new SyntaxError('`classname` is not specified')
    const CONSTRUCTOR = expressions[value.classname]
    if (!CONSTRUCTOR) throw new SyntaxError(`Unknown expression '${value.classname}'`)
    try {
      return new CONSTRUCTOR(value)
    }
    catch (e) {
      throw new JQLError('SyntaxError', `Fail to parse expression '${value.classname}'`, e)
    }
  }
  else {
    return new Value({ value, type: getType(value) })
  }
}
