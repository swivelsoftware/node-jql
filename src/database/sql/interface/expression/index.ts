export interface Expression {
  classname: string
  [key: string]: any
}

export { BetweenExpression as $between } from "./between";
export { BinaryExpression as $binary } from "./binary";
export { CaseExpression as $case } from "./case";
export { ColumnExpression as $column } from "./column";
export { ExistsExpression as $exists } from "./exists";
export { FunctionExpression as $function } from "./function";
export { AndGroupedExpression as $and, OrGroupedExpression as $or } from './grouped'
export { InExpression as $in } from "./in";
export { LikeExpression as $like } from "./like";
export { ValueExpression as $value } from "./value";