import { IJQL } from '../index.if'

/**
 * Base JQL expression interface
 */
export interface IExpression extends IJQL {}

/**
 * Base JQL expression interface (returns true or false)
 */
export interface IConditionalExpression extends IExpression {}
