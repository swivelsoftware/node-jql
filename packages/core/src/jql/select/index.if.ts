import { IJQL } from '../index.if'
import { IResultColumn } from './resultColumn/index.if'

/**
 * SELECT ... FROM ...
 */
export interface IQuery extends IJQL {
  $select?: IResultColumn[]
  // TODO
}
