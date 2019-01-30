if (!global['Proxy']) global['Proxy'] = require('proxy-polyfill')

export { Database } from './database/index'
export { Table } from './database/metadata/table'
export { Column } from './database/metadata/column'
export { ResultSet, Index } from './database/sandbox/resultset'
export * from './database/sql/index'
