/* tslint:disable:no-console */

import chalk = require('chalk')
import moment = require('moment')
import { resolve, sep } from 'path'
import { getEnv } from './env'

const ROOT = resolve(__dirname, '..')

type LogLevel = 'DEBUG'|'INFO'|'WARN'|'ERROR'

export class Logger {
  private readonly tag: string
  private levels: LogLevel[]

  constructor(filepath: string) {
    filepath = filepath.replace(ROOT, '')
    if (filepath.startsWith(sep)) filepath = filepath.substr(1)
    this.tag = `node-jql:${filepath}`

    const levels = (getEnv('logLevels') || 'DEBUG,INFO,WARN,ERROR').split(',')
    this.setLogLevels(...levels as LogLevel[])
  }

  public setLogLevels(...levels: LogLevel[]) {
    this.levels = levels
  }

  public debug(...args: any[]) {
    this.print('DEBUG', ...args)
  }

  public info(...args: any[]) {
    this.print('INFO', ...args)
  }

  public warn(...args: any[]) {
    this.print('WARN', ...args)
  }

  public error(...args: any[]) {
    this.print('ERROR', ...args)
  }

  private print(level: LogLevel, ...args: any[]) {
    if (this.levels.indexOf(level) > -1) {
      switch (level) {
        case 'DEBUG':
          args.unshift(chalk.default.gray(this.tag))
          args.unshift(chalk.default.bgBlackBright('[DEBUG]'))
          args.unshift(moment.utc().format('YYYY-MM-DD HH:mm:ss'))
          console.debug(...args)
          break
        case 'INFO':
          args.unshift(this.tag)
          args.unshift(chalk.default.inverse('[INFO]'))
          args.unshift(moment.utc().format('YYYY-MM-DD HH:mm:ss'))
          console.info(...args)
          break
        case 'WARN':
          args.unshift(chalk.default.yellow(this.tag))
          args.unshift(chalk.default.bgYellow('[WARN]'))
          args.unshift(moment.utc().format('YYYY-MM-DD HH:mm:ss'))
          console.warn(...args)
          break
        case 'ERROR':
          args.unshift(chalk.default.red(this.tag))
          args.unshift(chalk.default.bgRed('[ERROR]'))
          args.unshift(moment.utc().format('YYYY-MM-DD HH:mm:ss'))
          console.error(...args)
          break
      }
    }
  }
}
