import { JQLError } from '../../../utils/error'
import { getType } from '../../schema/interface'
import { BetweenExpression } from './between'
import { BinaryExpression } from './binary'
import { CaseExpression } from './case'
import { ColumnExpression } from './column'
import { ExistsExpression } from './exists'
import { FunctionExpression } from './function'
import { AndExpressions, OrExpressions } from './grouped'
import { InExpression } from './in'
import { Expression } from './interface'
import { IsNullExpression } from './isNull'
import { LikeExpression } from './like'
import { UnknownExpression } from './unknown'
import { ValueExpression } from './value'

export const expressions = {
  AndExpressions,
  BetweenExpression,
  BinaryExpression,
  CaseExpression,
  ColumnExpression,
  ExistsExpression,
  FunctionExpression,
  OrExpressions,
  InExpression,
  IsNullExpression,
  LikeExpression,
  UnknownExpression,
  ValueExpression,
}

export function parseExpression(value: any): Expression {
  if (value instanceof Expression) {
    return value
  }
  else if (typeof value === 'object' && !Array.isArray(value)) {
    if (!value.classname) throw new JQLError('Unknown expression without classname')
    const CONSTRUCTOR = expressions[value.classname]
    if (!CONSTRUCTOR) throw new JQLError(`Unknown expression with classname '${value.classname}'`)
    try {
      return new CONSTRUCTOR(value)
    }
    catch (e) {
      throw new JQLError(`Fail to parse expression with classname '${value.classname}'`, e)
    }
  }
  else {
    return new ValueExpression({ value, type: getType(value) })
  }
}
