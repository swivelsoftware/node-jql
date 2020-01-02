import { IColumnExpression } from './expression/index.if'

/**
 * SQL builder interface
 */
export interface IBuilder<T extends IStringify> {
  /**
   * Return SQL instance
   */
  build(): T

  /**
   * Return SQL JSON
   */
  toJson(): any
}

/**
 * Class that can be parsed from JSON to instance
 */
export interface IParseable {
  /**
   * Class name for parsing from JSON
   */
  classname: string
}

/**
 * Class that can be stringified
 */
export interface IStringify {
  // @override
  toString(): string

  /**
   * Can be converted from instance to JSON
   */
  toJson(): any
}

/**
 * SQL interface
 */
export interface ISQL extends IParseable {
}

/**
 * Expression interface
 */
export interface IExpression extends ISQL {
}

/**
 * Table column definition
 */
export interface IColumn {
  name: string
  type: string
  typeArgs?: any[]
  options?: string[]
}

/**
 * Raw string constraint
 */
export interface IConstraint extends IParseable {
  value: string
}

/**
 * PRIMAYR KEY constraint
 */
export interface IPrimaryKeyConstraint extends IConstraint {
  columns: IColumnExpression[]
}
