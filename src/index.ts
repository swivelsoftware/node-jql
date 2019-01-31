if (!global['Proxy']) global['Proxy'] = require('proxy-polyfill')

export { Database } from './database/index'
export { IDatabaseOptions } from './database/options'
export { Metadata } from './database/metadata/index'
export { Table } from './database/metadata/table'
export { Column, Type } from './database/metadata/column'
export { ICursor } from './database/sandbox/cursor'
export { ResultSet, Index } from './database/sandbox/resultset'
export * from './database/sql/index'
