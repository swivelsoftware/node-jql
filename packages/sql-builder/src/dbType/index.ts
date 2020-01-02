import deepmerge = require('deepmerge')
import _ = require('lodash')
import { IDBConfig } from './index.if'

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
