import { IColumnExpression } from './expression/index.if'

/**
 * Type
 */
export interface IType {
  name: string
  args?: any[]
}

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
 * Expression interface that returns True or False
 */
export interface IConditional extends IExpression {
}

/**
 * Table column definition
 */
export interface IColumn {
  name: string
  type: IType
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

/**
 * START TRANSACTION ... COMMIT
 */
export interface ITransaction extends ISQL {
  sqls: ISQL[]
  mode?: 'writeonly'|'readonly'|'readwrite'
}
