import _ = require('lodash')
import format = require('string-format')
import { dbConfigs, dbType } from '.'
import { isUndefined, stringify as valStringify } from '..'
import { ICreateFunction, ICreateSchema, ICreateTable, ICreateTableSelect } from '../create/index.if'
import { Delete } from '../delete'
import { IDropFunction, IDropSchema, IDropTable } from '../drop/index.if'
import { IBetweenExpression, IBinaryExpression, ICaseExpression, IColumnDefExpression, IColumnExpression, IExistsExpression, IFunctionExpression, IGroupExpression, IMathExpression, IQueryExpression, IUnknown, IValue, IVariable } from '../expression/index.if'
import { IColumn, IConstraint, IExpression, IPrimaryKeyConstraint, IStringify, IType } from '../index.if'
import { IInsert, IInsertSelect } from '../insert/index.if'
import { IFromFunctionTable, IFromTable, IGroupBy, IOrderBy, IQuery, IResultColumn } from '../select/index.if'
import { IUpdate } from '../update/index.if'

/**
 * Default set of stringify methods, based on mysql
 */
const _default: { [key: string]: (json: any) => string } = {
  Type(json: IType): string {
    let str = json.name
    if (json.args && json.args.length) str += `(${json.args.map(v => valStringify(v)).join(', ')})`
    return str
  },
  Column(json: IColumn): string {
    let str = `\`${json.name}\` ${json.type.toString()}`
    if (json.options && json.options.length) str += ` ${json.options.join(' ')}`
    return str
  },
  Constraint(json: IConstraint): string {
    return json.value
  },
  PrimaryKeyConstraint(json: IPrimaryKeyConstraint): string {
    return `PRIMARY KEY(${json.columns.map(col => col.toString()).join(', ')})`
  },

  // create
  CreateFunction(json: ICreateFunction): string {
    let str = `CREATE FUNCTION \`${json.name}\` (${(json.parameters || []).map(([name, type]) => `\`${name}\` ${type.toString()}`).join(', ')})`
    str += ` RETURNS ${json.returnType.toString()}`
    if (json.deterministic) str += ' DETERMINISTIC'
    str += ` ${json.code}`
    return str
  },
  CreateSchema(json: ICreateSchema): string {
    let str = `${json.ifNotExists ? 'CREATE SCHEMA IF NOT EXISTS' : 'CREATE SCHEMA'} \`${json.name}\``
    if (json.options) str += ` ${json.options.join(' ')}`
    return str
  },
  CreateTable(json: ICreateTable): string {
    const columns: any[] = [...json.columns, ...(json.constraints || [])]
    let str = `${json.ifNotExists ? 'CREATE TABLE IF NOT EXISTS' : 'CREATE TABLE'} ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``} (${columns.map(col => col.toString()).join(', ')})`
    if (json.options && json.options.length) str += ` ${json.options.join(' ')}`
    return str
  },
  CreateTableSelect(json: ICreateTableSelect): string {
    let str = `${json.ifNotExists ? 'CREATE TABLE IF NOT EXISTS' : 'CREATE TABLE'} ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``}`
    const columns: any[] = [...(json.columns || []), ...(json.constraints || [])]
    if (columns.length) str += ` (${columns.map(col => col.toString()).join(', ')})`
    if (json.options && json.options.length) str += ` ${json.options.join(' ')}`
    if (json.whenDuplicate) str += ` ${json.whenDuplicate}`
    str += ` AS ${json.query.toString()}`
    return str
  },

  // delete
  Delete(json: Delete): string {
    let str = `DELETE FROM ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``}`
    if (json.where) str += ` WHERE ${json.where.toString()}`
    return str
  },

  // drop
  DropSchema(json: IDropSchema): string {
    return `${json.ifExists ? 'DROP SCHEMA IF EXISTS' : 'DROP SCHEMA'} \`${json.name}\``
  },
  DropTable(json: IDropTable): string {
    return `${json.ifExists ? 'DROP TABLE IF EXISTS' : 'DROP TABLE'} ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``}`
  },
  DropFunction(json: IDropFunction): string {
    return `${json.ifExists ? 'DROP FUNCTION IF EXISTS' : 'DROP FUNCTION'} \`${json.name}\``
  },

  // expression
  BetweenExpression(json: IBetweenExpression): string {
    return `${(json.left as IExpression).toString()} ${json.not ? 'NOT BETWEEN' : 'BETWEEN'} ${(json.start as IExpression).toString()} AND ${(json.end as IExpression).toString()}`
  },
  BinaryExpression(json: IBinaryExpression): string {
    return `${(json.left as IExpression).toString()} ${json.not ? json.operator === 'IS' ? `IS NOT` : `NOT ${json.operator}` : json.operator} ${(json.right as IExpression).toString()}`
  },
  CaseExpression(json: ICaseExpression): string {
    return `CASE ${json.cases.map(({ when, then }) => `WHEN ${when.toString()} THEN ${then.toString()}`).join(' ')} ELSE ${(json.else as IExpression).toString()}`
  },
  ColumnDefExpression(json: IColumnDefExpression): string {
    return json.column.toString()
  },
  ColumnExpression(json: IColumnExpression): string {
    return json.table ? `\`${json.table}\`.\`${json.name}\`` : `\`${json.name}\``
  },
  ExistsExpression(json: IExistsExpression): string {
    return `EXISTS ${json.query.toString()}`
  },
  FunctionExpression(json: IFunctionExpression): string {
    const parameters_ = (json.arguments || []).map(expr => expr.toString())
    if (isUndefined(json['argsFormat'])) {
      return `${json.name.toLocaleUpperCase()}(${parameters_.join(', ')})`
    }
    else {
      return `${json.name.toLocaleUpperCase()}(${format(json['argsFormat'], ...parameters_)})`
    }
  },
  GroupExpression(json: IGroupExpression): string {
    let result = json.expressions.map(e => e.toString()).join(` ${json.operator} `)
    if (json.expressions.length > 1) result = `(${result})`
    return result
  },
  MathExpression(json: IMathExpression): string {
    return `${(json.left as IExpression).toString()} ${json.operator} ${(json.right as IExpression).toString()}`
  },
  QueryExpression(json: IQueryExpression): string {
    return json.query.toString()
  },
  Unknown(json: IUnknown): string {
    return json['value'] ? json['value'].toString() : '?'
  },
  Value(json: IValue): string {
    return isUndefined(json.value) ? 'NULL' : valStringify(json.value)
  },
  Variable(json: IVariable): string {
    return `@${json.name}`
  },

  // insert
  Insert(json: IInsert): string {
    let str = `INSERT INTO ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``}`
    if (json.columns && json.columns.length) {
      str += `(${json.columns.map(c => `\`${c}\``).join(', ')})`
      str += ` VALUES ${json.values.map(row => `(${(json.columns || []).map(c => valStringify(row[c])).join(', ')})`).join(', ')}`
    }
    else {
      const values = json.values as any[][]
      str += ` VALUES ${values.map(row => `(${row.map(v => valStringify(v)).join(', ')})`).join(', ')}`
    }
    return str
  },
  InsertSelect(json: IInsertSelect): string {
    let str = `INSERT INTO ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``}`
    if (json.columns && json.columns.length) {
      str += `(${json.columns.map(c => `\`${c}\``).join(', ')})`
    }
    str += ` ${json.query.toString()}`
    return str
  },

  // select
  ResultColumn(json: IResultColumn): string {
    return `${json.expr.toString()}${json.as ? ` AS \`${json.as}\`` : ''}`
  },
  FromTable(json: IFromTable): string {
    return `${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``}${json.as ? ` AS \`${json.as}\`` : ''}`
  },
  FromFunctionTable(json: IFromFunctionTable): string {
    return `${json.expr.toString()}${json.as ? ` AS \`${json.as}\`` : ''}`
  },
  GroupBy(json: IGroupBy): string {
    let str = json.expr.toString()
    if (json.having) str += ` HAVING ${json.having.toString()}`
    return str
  },
  OrderBy(json: IOrderBy): string {
    return `${json.expr.toString()} ${json.order}`
  },
  Query(json: IQuery): string {
    let str = json.select && json.select.length ? `SELECT ${json.select.map(sel => sel.toString()).join(', ')}` : 'SELECT *'
    if (json.from) str += ` FROM ${json.from.map(fr => fr.toString()).join(', ')}`
    if (json.groupBy) str += ` GROUP BY ${json.groupBy.toString()}`
    if (json.where) str += ` WHERE ${json.where.toString()}`
    if (json.orderBy && json.orderBy.length) str += ` ORDER BY ${json.orderBy.map(ord => ord.toString()).join(', ')}`
    return str
  },

  // update
  Update(json: IUpdate): string {
    let str = `UPDATE ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``} SET ${json.set.map(expr => expr.toString()).join(', ')}`
    if (json.where) str += ` WHERE ${json.where.toString()}`
    return str
  },
}

/**
 * Stringify based on DB type
 * @param classname [string]
 * @param json [IStringify]
 */
export function stringify<T extends IStringify>(classname: string, json: T): string {
  return _.has(dbConfigs, [dbType, 'stringify', classname])
    ? _.get(dbConfigs, [dbType, 'stringify', classname])(json)
    : _default[classname](json)
}
