import deepmerge = require('deepmerge')
import _ = require('lodash')
import { isJSON } from '.'
import { Expression } from './expression'
import { ColumnExpression } from './expression/column'
import { FunctionExpression } from './expression/function'
import { Value } from './expression/value'
import { IDBConfig, IStringify } from './index.if'

/**
 * The current DB type used
 */
export let dbType: string

/**
 * DB types supported
 */
export const dbConfigs: { [key: string]: IDBConfig } = {}

/**
 * Specify the DB type used
 * @param dbType_ [string]
 */
export function use(dbType_: string) {
  if (!dbConfigs[dbType_]) throw new Error(`Database type '${dbType_}' currently not supported`)
  dbType = dbType_
}

/**
 * Add support for different DB types
 * @param dbType [string]
 * @param config [IDBConfig]
 */
export function register(dbType: string, config: IDBConfig) {
  dbConfigs[dbType] = config
}

/**
 * Add support for different DB types, based on registered DB type
 * @param dbType [string]
 * @param newDBType [string]
 * @param config [IDBConfig]
 */
export function extend(dbType: string, newDBType: string, config: IDBConfig) {
  if (!dbConfigs[dbType]) throw new Error(`Database type '${dbType}' currently not supported`)
  dbConfigs[newDBType] = deepmerge(_.cloneDeep(dbConfigs[dbType]), config)
}

/**
 * Stringify function for different DB types
 * @param classname [string]
 * @param json [T]
 */
export function stringify<T extends IStringify>(classname: string, json: T): string|null {
  if (!dbConfigs[dbType].stringify || !dbConfigs[dbType].stringify[classname]) return null
  return dbConfigs[dbType].stringify[classname](json)
}

/**
 * Register mysql
 */
register('mysql', {
  functions: {
    formats: {
      // String functions
      POSITION: '{0} IN {1}',

      // Date functions
      ADDDATE: '{0}, INTERVAL {1} {2}',
      DATE_ADD: '{0}, INTERVAL {1} {2}',
      DATE_SUB: '{0}, INTERVAL {1} {2}',
      EXTRACT: '{0} FROM {1}',
      SUBDATE: '{0}, INTERVAL {1} {2}',
      CAST: '{0} AS {1}',

      // JSON functions
      JSON_TABLE: '{0}, {1} {2}',
    },
    validations: {
      JSON_TABLE(args: Expression[]): boolean {
        const $0 = args[0]
        if (!(
          ($0 instanceof Value && isJSON($0.value)) ||  // Simple JSON string
          ($0 instanceof ColumnExpression) ||           // A column with JSON string. Used after another table
          ($0 instanceof FunctionExpression)            // A function call returning JSON string
        )) {
          return false
        }
        const $1 = args[1]
        if (!($1 instanceof Value && typeof $1.value === 'string')) {
          return false
        }
        const $2 = args[2]
        if (!($2 instanceof FunctionExpression && $2.name.toLocaleUpperCase() === 'COLUMNS')) {
          return false
        }
        return true
      },
    },
  },
})

// use mysql by default
use('mysql')
