import { IBinaryExpression } from '../expression/index.if'
import { IConditional, ISQL } from '../index.if'

/**
 * UPDATE SET
 */
export interface IUpdate extends ISQL {
  schema?: string
  name: string
  set: IBinaryExpression[]
  where?: IConditional
}
