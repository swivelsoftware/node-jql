import { ColumnDef } from './column'
import { TableConstraint } from './constraint'

/**
 * Table definition
 */
export class TableDef {
  /**
   * Table columns
   */
  public readonly columns: ColumnDef[] = []

  /**
   * Table constraints
   */
  public constraints: TableConstraint[] = []

  constructor(
    /**
     * Table name
     */
    public name: string,
  ) {
  }

  /**
   * add table column
   * @param column [ColumnDef]
   */
  public addColumn(column: ColumnDef): TableDef {
    this.columns.push(column)
    return this
  }

  /**
   * add table constraint
   * @param constraint [TableConstraint]
   */
  public addConstraint(constraint: TableConstraint): TableDef {
    this.constraints.push(constraint)
    return this
  }
}
