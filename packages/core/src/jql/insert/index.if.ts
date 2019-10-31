import { IVariable } from '../expressions/variable/index.if'
import { IJQL } from '../index.if'
import { ISchemaTable } from '../select/fromTable/index.if'

/**
 * Row to be inserted
 */
export type InsertValue = Array<IVariable|any>

/**
 * INSERT INTO ...
 */
export interface IInsertJQL extends IJQL {
  $into: ISchemaTable
  mappings?: string[]
  $values: InsertValue[]
}
