import { IJQL } from '../../index.if'

/**
 * Pagination
 */
export interface ILimitBy extends IJQL {
  $limit: number
  $offset?: number
}
