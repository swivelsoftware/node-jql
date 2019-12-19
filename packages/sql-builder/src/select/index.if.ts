import { IFunctionExpression } from '../expression/index.if'
import { IExpression, IParseable, ISQL } from '../index.if'

/**
 * Selected result column
 */
export interface IResultColumn {
  expr: IExpression
  as?: string
}

/**
 * Base data source
 */
export interface IDatasource extends IParseable {
  as?: string
}

/**
 * Table data source
 */
export interface IFromTable extends IDatasource {
  database?: string
  name: string
}

/**
 * Function table data source
 */
export interface IFromFunctionTable extends IDatasource {
  expr: IFunctionExpression
  as: string
}

/**
 * SELECT
 */
export interface IQuery extends ISQL {
  select?: IResultColumn[]
  from?: IDatasource[]
}
