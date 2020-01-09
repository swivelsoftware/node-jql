import moment = require('moment')

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
  public abstract debug(...msg: any[])

  /**
   * Log level
   * @param msg [Array]
   */
  public abstract log(...msg: any[])

  /**
   * Info level
   * @param msg [Array]
   */
  public abstract info(...msg: any[])

  /**
   * Warn level
   * @param msg [Array]
   */
  public abstract warn(...msg: any[])

  /**
   * Error level
   * @param msg [Array]
   */
  public abstract error(...msg: any[])
}

/**
 * Log in Console
 */
export class ConsoleLogger extends Logger {
  public dateFormat: string = 'YYYY-MM-DD kk:mm:ss.SSS'

  // @override
  public debug(...msg: any[]) {
    console.debug(`[${moment().format(this.dateFormat)}]`, ...msg)
  }

  // @override
  public log(...msg: any[]) {
    console.log(`[${moment().format(this.dateFormat)}]`, ...msg)
  }

  // @override
  public info(...msg: any[]) {
    console.info(`[${moment().format(this.dateFormat)}]`, ...msg)
  }

  // @override
  public warn(...msg: any[]) {
    console.warn(`[${moment().format(this.dateFormat)}]`, ...msg)
  }

  // @override
  public error(...msg: any[]) {
    console.error(`[${moment().format(this.dateFormat)}]`, ...msg)
  }
}
