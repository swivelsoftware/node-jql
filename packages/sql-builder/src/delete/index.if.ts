import { IExpression, ISQL } from '../index.if'

/**
 * DELETE FROM
 */
export interface IDelete extends ISQL {
  database?: string
  name: string
  where?: IExpression
}
