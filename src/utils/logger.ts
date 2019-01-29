/* tslint:disable:no-console */

import chalk = require('chalk')
import { resolve, sep } from 'path'

const ROOT = resolve(__dirname, '..')

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export class Logger {
  private readonly tag: string

  constructor(filepath: string) {
    filepath = filepath.replace(ROOT, '')
    if (filepath.startsWith(sep)) filepath = filepath.substr(1)
    this.tag = `node-jql:${filepath}`
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
    if (process.env.NODE_ENV !== 'production') {
      switch (level) {
        case 'DEBUG':
          args = [chalk.default.bgBlackBright('[DEBUG]'), chalk.default.gray(this.tag), ...args.map((arg) => chalk.default.gray(arg))]
          console.debug(...args)
          break
        case 'INFO':
          args = [chalk.default.inverse('[INFO]'), this.tag, ...args]
          console.info(...args)
          break
        case 'WARN':
          args = [chalk.default.bgYellow('[WARN]'), chalk.default.yellow(this.tag), ...args.map((arg) => chalk.default.yellow(arg))]
          console.warn(...args)
          break
        case 'ERROR':
          args = [chalk.default.bgRed('[WARN]'), chalk.default.red(this.tag), ...args.map((arg) => chalk.default.red(arg))]
          console.error(...args)
          break
        default:
          break
      }
    }
  }
}
