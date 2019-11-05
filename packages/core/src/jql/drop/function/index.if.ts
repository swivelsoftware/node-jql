import { IJQL } from '../../index.if'

/**
 * Drop function
 */
export interface IDropFunctionJQL extends IJQL {
  /**
   * Function name
   */
  function: string

  /**
   * Suppress error if functions does not exist
   */
  $ifExists?: boolean
}
