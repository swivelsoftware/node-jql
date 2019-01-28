if (!global['Proxy']) global['Proxy'] = require('proxy-polyfill')

export { Database } from './database/index'
export * from './database/sql/index'
