import format = require('string-format')
import * as $ from '.'
import { isUndefined, stringify as valStringify } from '..'
import { Column } from '../column'
import { Constraint, PrimaryKeyConstraint } from '../constraint'
import { CreateSchema } from '../create/schema'
import { CreateTable, CreateTableSelect } from '../create/table'
import { BetweenExpression } from '../expression/between'
import { BinaryExpression } from '../expression/binary'
import { CaseExpression } from '../expression/case'
import { ColumnExpression } from '../expression/column'
import { ColumnDefExpression } from '../expression/column-def'
import { ExistsExpression } from '../expression/exists'
import { FunctionExpression } from '../expression/function'
import { GroupExpression } from '../expression/group'
import { MathExpression } from '../expression/math'
import { QueryExpression } from '../expression/query'
import { Unknown } from '../expression/unknown'
import { Value } from '../expression/value'
import { Variable } from '../expression/variable'
import { IStringify } from '../index.if'
import { Insert, InsertSelect } from '../insert'
import { FromFunctionTable, FromTable, GroupBy, OrderBy, Query, ResultColumn } from '../select'

/**
 * Default set of stringify methods, based on mysql
 */
const _default: { [key: string]: (json: IStringify) => string } = {
  Column(json: Column): string {
    let str = `\`${json.name}\` ${json.type}`
    if (json.typeArgs.length) str += `(${json.typeArgs.map(arg => valStringify(arg)).join(', ')})`
    if (json.options.length) str += ` ${json.options.join(' ')}`
    return str
  },
  Constraint(json: Constraint): string {
    return json.value
  },
  PrimaryKeyConstraint(json: PrimaryKeyConstraint): string {
    return `PRIMARY KEY(${json.columns.map(col => col.toString()).join(', ')})`
  },

  // create
  CreateSchema(json: CreateSchema): string {
    let str = `${json.ifNotExists ? 'CREATE SCHEMA IF NOT EXISTS' : 'CREATE SCHEMA'} \`${json.name}\``
    if (json.options) str += ` ${json.options.join(' ')}`
    return str
  },
  CreateTable(json: CreateTable): string {
    const columns: IStringify[] = [...json.columns, ...json.constraints]
    let str = `${json.ifNotExists ? 'CREATE TABLE IF NOT EXISTS' : 'CREATE TABLE'} ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``} (${columns.map(col => col.toString()).join(', ')})`
    if (json.options.length) str += ` ${json.options.join(' ')}`
    return str
  },
  CreateTableSelect(json: CreateTableSelect): string {
    let str = `${json.ifNotExists ? 'CREATE TABLE IF NOT EXISTS' : 'CREATE TABLE'} ${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``}`
    const columns: IStringify[] = [...json.columns, ...json.constraints]
    if (columns.length) str += ` (${columns.map(col => col.toString()).join(', ')})`
    if (json.options.length) str += ` ${json.options.join(' ')}`
    if (json.whenDuplicate) str += ` ${json.whenDuplicate}`
    str += ` AS ${json.query.toString()}`
    return str
  },

  // expression
  BetweenExpression(json: BetweenExpression): string {
    return `${json.left.toString()} ${json.not ? 'NOT BETWEEN' : 'BETWEEN'} ${json.start.toString()} AND ${json.end.toString()}`
  },
  BinaryExpression(json: BinaryExpression): string {
    return `${json.left.toString()} ${json.not ? json.operator === 'IS' ? `IS NOT` : `NOT ${json.operator}` : json.operator} ${json.right.toString()}`
  },
  CaseExpression(json: CaseExpression): string {
    return `CASE ${json.cases.map(({ when, then }) => `WHEN ${when.toString()} THEN ${then.toString()}`).join(' ')} ELSE ${json.else.toString()}`
  },
  ColumnDefExpression(json: ColumnDefExpression): string {
    return json.column.toString()
  },
  ColumnExpression(json: ColumnExpression): string {
    return json.table ? `\`${json.table}\`.\`${json.name}\`` : `\`${json.name}\``
  },
  ExistsExpression(json: ExistsExpression): string {
    return `EXISTS ${json.query.toString()}`
  },
  FunctionExpression(json: FunctionExpression): string {
    const parameters_ = json.arguments.map(expr => expr.toString())
    if (isUndefined(json.argsFormat)) {
      return `${json.name.toLocaleUpperCase()}(${parameters_.join(', ')})`
    }
    else {
      return `${json.name.toLocaleUpperCase()}(${format(json.argsFormat, ...parameters_)})`
    }
  },
  GroupExpression(json: GroupExpression): string {
    let result = json.expressions.map(e => e.toString()).join(` ${json.operator} `)
    if (json.expressions.length > 1) result = `(${result})`
    return result
  },
  MathExpression(json: MathExpression): string {
    return `${json.left.toString()} ${json.operator} ${json.right.toString()}`
  },
  QueryExpression(json: QueryExpression): string {
    return json.query.toString()
  },
  Unknown(json: Unknown): string {
    return json.value ? json.value.toString() : '?'
  },
  Value(json: Value): string {
    return isUndefined(json.value) ? 'NULL' : valStringify(json.value)
  },
  Variable(json: Variable): string {
    return `@${json.name}`
  },

  // insert
  Insert(json: Insert): string {
    let str = `INSERT INTO ${json.into.toString()}`
    if (json.columns.length) {
      str += `(${json.columns.map(c => `\`${c}\``).join(', ')})`
      str += ` VALUES ${json.values.map(row => `(${json.columns.map(c => valStringify(row[c])).join(', ')})`).join(', ')}`
    }
    else {
      const values = json.values as any[][]
      str += ` VALUES ${values.map(row => `(${row.map(v => valStringify(v)).join(', ')})`).join(', ')}`
    }
    return str
  },
  InsertSelect(json: InsertSelect): string {
    let str = `INSERT INTO ${json.into.toString()}`
    if (json.columns.length) {
      str += `(${json.columns.map(c => `\`${c}\``).join(', ')})`
    }
    str += ` ${json.query.toString()}`
    return str
  },

  // select
  ResultColumn(json: ResultColumn): string {
    return `${json.expr.toString()}${json.as ? ` AS \`${json.as}\`` : ''}`
  },
  FromTable(json: FromTable): string {
    return `${json.database ? `\`${json.database}\`.\`${json.name}\`` : `\`${json.name}\``}${json.as ? ` AS \`${json.as}\`` : ''}`
  },
  FromFunctionTable(json: FromFunctionTable): string {
    return `${json.expr.toString()}${json.as ? ` AS \`${json.as}\`` : ''}`
  },
  GroupBy(json: GroupBy): string {
    let str = json.expr.toString()
    if (json.having) str += ` HAVING ${json.having.toString()}`
    return str
  },
  OrderBy(json: OrderBy): string {
    return `${json.expr.toString()} ${json.order}`
  },
  Query(json: Query): string {
    let str = json.select.length ? `SELECT ${json.select.map(sel => sel.toString()).join(', ')}` : 'SELECT *'
    if (json.from) str += ` FROM ${json.from.map(fr => fr.toString()).join(', ')}`
    if (json.groupBy) str += ` GROUP BY ${json.groupBy.toString()}`
    if (json.where) str += ` WHERE ${json.where.toString()}`
    if (json.orderBy.length) str += ` ORDER BY ${json.orderBy.map(ord => ord.toString()).join(', ')}`
    return str
  },
}

/**
 * Stringify based on DB type
 * @param classname [string]
 * @param json [IStringify]
 */
export function stringify<T extends IStringify>(classname: string, json: T): string {
  if ($.dbConfigs[$.dbType] && $.dbConfigs[$.dbType].stringify && $.dbConfigs[$.dbType].stringify[classname]) {
    return $.dbConfigs[$.dbType].stringify[classname](json)
  }
  return _default[classname](json)
}
