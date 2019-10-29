import { IJQL } from '../../index.if'

/**
 * drop function
 */
export interface IDropFunctionJQL extends IJQL {
  function: string
  $ifExists?: boolean
}
