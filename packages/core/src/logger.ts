import chalk from 'chalk'
import moment = require('moment')

const LOG_LEVELS = ['debug', 'log', 'info', 'warn', 'error']

interface ILog {
  tag: string
  sessionId?: string
  msg: any[]
}

/**
 * Define how to handle the logs
 */
export abstract class Logger {
  constructor(public readonly logLevel: string = 'warn') {
  }

  /**
   * Debug level
   * @param msg [Array]
   */
  public abstract debug(log: ILog)

  /**
   * Log level
   * @param msg [Array]
   */
  public abstract log(log: ILog)

  /**
   * Info level
   * @param msg [Array]
   */
  public abstract info(log: ILog)

  /**
   * Warn level
   * @param msg [Array]
   */
  public abstract warn(log: ILog)

  /**
   * Error level
   * @param msg [Array]
   */
  public abstract error(log: ILog)
}

/**
 * Log in Console
 */
export class ConsoleLogger extends Logger {
  public dateFormat: string = 'YYYY-MM-DD kk:mm:ss.SSS'

  // @override
  public debug(log: ILog) {
    if (this.check('debug')) {
      const msg: any[] = [chalk.gray('DEBUG'), chalk.gray(`[${moment().format(this.dateFormat)}]`)]
      if (log.sessionId) msg.push(chalk.gray(`{${log.sessionId}}`))
      msg.push(chalk.gray(...log.msg))
      msg.push(chalk.gray(`#${log.tag}`))
      console.debug(...msg)
    }
  }

  // @override
  public log(log: ILog) {
    if (this.check('log')) {
      const msg: any[] = ['LOG', `[${moment().format(this.dateFormat)}]`]
      if (log.sessionId) msg.push(chalk.gray(`{${log.sessionId}}`))
      msg.push(chalk.gray(...log.msg))
      msg.push(chalk.gray(`#${log.tag}`))
      console.log(...msg)
    }
  }

  // @override
  public info(log: ILog) {
    if (this.check('info')) {
      const msg: any[] = ['INFO', `[${moment().format(this.dateFormat)}]`]
      if (log.sessionId) msg.push(chalk.gray(`{${log.sessionId}}`))
      msg.push(chalk.gray(...log.msg))
      msg.push(chalk.gray(`#${log.tag}`))
      console.info(...msg)
    }
  }

  // @override
  public warn(log: ILog) {
    if (this.check('warn')) {
      const msg: any[] = [chalk.yellow('WARN'), chalk.yellow(`[${moment().format(this.dateFormat)}]`)]
      if (log.sessionId) msg.push(`{${log.sessionId}}`)
      msg.push(chalk.yellow(...log.msg))
      msg.push(`#${log.tag}`)
      console.warn(...msg)
    }
  }

  // @override
  public error(log: ILog) {
    if (this.check('error')) {
      const msg: any[] = [chalk.yellow('ERROR'), chalk.red(`[${moment().format(this.dateFormat)}]`)]
      if (log.sessionId) msg.push(`{${log.sessionId}}`)
      msg.push(chalk.red(...log.msg))
      msg.push(`#${log.tag}`)
      console.error(...msg)
    }
  }

  private check(logLevel: string): boolean {
    const current = LOG_LEVELS.indexOf(this.logLevel)
    const target = LOG_LEVELS.indexOf(logLevel)
    return current <= target
  }
}
