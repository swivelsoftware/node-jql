import { IConditional, ISQL } from '../index.if'

/**
 * DELETE FROM
 */
export interface IDelete extends ISQL {
  schema?: string
  name: string
  where?: IConditional
}
