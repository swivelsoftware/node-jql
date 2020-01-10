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
  schema?: string
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
 * Groupping criteria
 */
export interface IGroupBy {
  expr: IExpression
  having?: IExpression
}

/**
 * Ordering criteria
 */
export interface IOrderBy {
  expr: IExpression
  order?: 'ASC'|'DESC'
}

/**
 * SELECT
 */
export interface IQuery extends ISQL {
  select?: IResultColumn[]
  from?: IDatasource[]
  where?: IExpression
  groupBy?: IGroupBy
  orderBy?: IOrderBy[]
}
