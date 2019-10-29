import { IJQL } from '../index.if'
import { IBinaryExpression } from '../expressions/binary/index.if'

/**
 * set variable
 */
export interface ISetVariableJQL extends IJQL {
  expression: IBinaryExpression
}
