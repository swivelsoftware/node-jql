export interface IExpression {
  classname?: string
  [key: string]: any
}

export interface IUnknownExpression {
  parameters?: string[]
}

export { BetweenExpression as $between, IBetweenExpression } from './between'
export { BinaryExpression as $binary, IBinaryExpression } from './binary'
export { CaseExpression as $case, ICaseExpression } from './case'
export { ColumnExpression as $column, IColumnExpression } from './column'
export { ExistsExpression as $exists, IExistsExpression } from './exists'
export { FunctionExpression as $function, IFunctionExpression } from './function'
export { AndGroupedExpression as $and, OrGroupedExpression as $or, IGroupedExpression } from './grouped'
export { InExpression as $in, InJson } from './in'
export { LikeExpression as $like, ILikeExpression } from './like'
export { ValueExpression as $value, IValueExpression } from './value'
