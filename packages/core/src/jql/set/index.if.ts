import { IBinaryExpression } from '../expressions/binary/index.if'
import { IJQL } from '../index.if'

/**
 * set variable
 */
export interface ISetVariableJQL extends IJQL {
  expression: IBinaryExpression
}
