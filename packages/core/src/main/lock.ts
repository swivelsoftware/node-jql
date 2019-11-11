import { ERROR_CODES, JQLError } from './error'
import { IEngineOptions } from './options'

/**
 * Table lock for handling simultaneous task
 */
export class ReadWriteLock {
  // requesting for read
  private readRequesting: string[] = []

  // reading processes
  private reading: string[] = []

  // request for write
  private writeRequesting: string[] = []

  // writing process
  private writing?: string

  // target is closed and cannot be able to use anymore
  private closed = false

  constructor(
    /**
     * Schema options
     */
    private readonly options: IEngineOptions,
  ) {
  }

  /**
   * Acquire read lock
   * @param tid [string]
   * @param checkCancel [Function]
   */
  public read(tid: string, checkCancel: () => void = () => { /* do nothing */ }): Promise<void> {
    return new Promise(resolve => {
      // already requesting
      if (this.readRequesting.indexOf(tid) > -1) {
        return resolve()
      }

      // already requested
      if (this.reading.indexOf(tid) > -1) {
        return resolve()
      }

      this.readRequesting.push(tid)
      const fn = () => {
        // check if canceled
        checkCancel()

        if (this.readRequesting.indexOf(tid) > -1) {
          // target closed
          if (this.closed) throw new JQLError(ERROR_CODES.CLOSED)

          /**
           * 1. Someone is writing, wait
           * 2. Someone is requesting for write lock, wait
           * 3. Too many people is reading, wait
           */
          if (!this.writing && !this.writeRequesting.length && this.reading.length < (this.options.maxSimultaneousRead || Number.MAX_SAFE_INTEGER)) {
            this.reading.push(tid)
            const i = this.readRequesting.indexOf(tid)
            this.readRequesting.splice(i, 1)  // i must be > -1
            return resolve()
          }
          setTimeout(fn, this.options.lockCheckInterval || 1)
        }
      }
    })
  }

  /**
   * Release read lock
   * @param tid [string]
   */
  public readEnd(tid: string): void {
    let i = this.readRequesting.indexOf(tid)
    if (i > -1) this.readRequesting.splice(i, 1)
    i = this.reading.indexOf(tid)
    if (i > -1) this.reading.splice(i, 1)
  }

  /**
   * Acquire write lock
   * @param tid [string]
   * @param checkCancel [Function]
   */
  public write(tid: string, checkCancel: () => void = () => { /* do nothing */ }): Promise<void> {
    return new Promise(resolve => {
      // already requesting
      if (this.writeRequesting.indexOf(tid) > -1) {
        return resolve()
      }

      // already requested
      if (this.writing === tid) {
        return resolve()
      }

      this.writeRequesting.push(tid)
      const fn = () => {
        // check if canceled
        checkCancel()

        const i = this.writeRequesting.indexOf(tid)

        if (i > -1) {
          // target closed
          if (this.closed) throw new JQLError(ERROR_CODES.CLOSED)

          if (i === 0) {
            /**
             * 1. Someone is reading, wait
             * 2. Someone is writing, wait
             */
            if (!this.reading.length && !this.writing) {
              this.writing = tid
              const i = this.writeRequesting.indexOf(tid)
              this.writeRequesting.splice(i, 1) // i must be > -1
              return resolve()
            }
            setTimeout(fn, this.options.lockCheckInterval || 1)
          }
        }
      }
      fn()
    })
  }

  /**
   * Release write lock
   * @param tid [string]
   */
  public writeEnd(tid: string): void {
    const i = this.writeRequesting.indexOf(tid)
    if (i > -1) this.writeRequesting.splice(i, 1)
    if (this.writing === tid) this.writing = undefined
  }

  /**
   * Close the lock
   * @param tid [string]
   * @param checkCancel [Function]
   */
  public close(tid: string, checkCancel: () => void = () => { /* do nothing */ }): Promise<void> {
    return this.write(tid, checkCancel)
      .then(() => {
        this.closed = true
      })
  }
}
