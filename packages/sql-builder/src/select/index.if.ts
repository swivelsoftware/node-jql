import { IFunctionExpression } from '../expression/index.if'
import { IConditional, IExpression, IParseable, ISQL } from '../index.if'

/**
 * Selected result column
 */
export interface IResultColumn {
  expr: IExpression
  as?: string
}

/**
 * JOIN statement
 */
export interface IJoin {
  operator: string
  table: IDatasource
  on?: IConditional
}

/**
 * Base data source
 */
export interface IDatasource extends IParseable {
  as?: string
  join?: IJoin[]
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
  having?: IConditional
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
  where?: IConditional
  groupBy?: IGroupBy
  orderBy?: IOrderBy[]
}
