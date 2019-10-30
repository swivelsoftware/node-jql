import { IConditionalExpression } from '../expressions/index.if'
import { IJQL } from '../index.if'
import { ISchemaTable } from '../select/fromTable/index.if'

/**
 * DELETE FROM ...
 */
export interface IDeleteJQL extends IJQL {
  $from: ISchemaTable
  $where?: IConditionalExpression
}
