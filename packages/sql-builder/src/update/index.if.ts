import { IBinaryExpression } from '../expression/index.if'
import { IExpression, ISQL } from '../index.if'

/**
 * UPDATE SET
 */
export interface IUpdate extends ISQL {
  schema?: string
  name: string
  set: IBinaryExpression[]
  where?: IExpression
}
