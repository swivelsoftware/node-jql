import axios, { AxiosRequestConfig } from 'axios'
import uuid from 'uuid/v4'
import EventEmitter from 'wolfy87-eventemitter'

/**
 * Task interface
 */
export abstract class Task<T> extends EventEmitter {
  public readonly id: string = uuid()

  protected started: boolean = false
  protected canceled: boolean = false

  // @override
  public emit(event: 'complete', result: T): Task<T>
  public emit(event: 'cancel'): Task<T>
  public emit(event: 'error', err: Error): Task<T>
  public emit(event: string, ...args: any[]): Task<T>
  public emit(event: RegExp, ...args: any[]): Task<T>
  public emit(event: string|RegExp, ...args: any[]): Task<T> {
    super.emit(event as any, ...args)
    return this
  }

  // @override
  public on(event: 'complete', listener: (result: T) => void): Task<T>
  public on(event: 'cancel', listener: Function): Task<T>
  public on(event: 'error', listener: (err: Error) => void): Task<T>
  public on(event: string, listener: Function): Task<T>
  public on(event: RegExp, listener: Function): Task<T>
  public on(event: string|RegExp, listener: Function): Task<T> {
    super.on(event as any, listener)
    return this
  }

  /**
   * Check if the task is canceled
   */
  public get isCanceled(): boolean {
    return this.canceled
  }

  /**
   * Start the task
   */
  public run(): Task<T> {
    if (!this.started) {
      this.started = true
      this.runContext()
    }
    return this
  }

  /**
   * Cancel the task
   */
  public cancel(): Task<T> {
    if (this.started) {
      this.canceled = true
      this.emit('cancel')
    }
    return this
  }

  /**
   * Define how this task works
   */
  protected abstract runContext()
}

/**
 * Extend a given Task
 */
export class ExtendTask<T, R = T> extends Task<R> {
  constructor(
    private task: Task<T>,
    private postProcess: (result: T) => R,
  ) {
    super()
  }

  // @override
  protected runContext() {
    this.task
      .on('complete', result => {
        this.emit('complete', this.postProcess(result))
      })
      .on('error', err => this.emit('error', err))
      .on('cancel', () => this.emit('cancel'))
      .run()
  }
}

/**
 * Promise task
 */
export class PromiseTask<T> extends Task<T> {
  public result: T|null = null
  private promise: Promise<T>

  constructor(promise: Promise<T>|((task: Task<T>) => Promise<T>)) {
    super()
    if (typeof promise === 'function') promise = promise(this)
    this.promise = promise
  }

  // @override
  protected runContext() {
    this.promise
      .then(result => {
        if (!this.canceled) this.emit('complete', this.result = result)
      })
      .catch(err => {
        if (!this.canceled) this.emit('error', err)
      })
  }
}

/**
 * Axios task
 */
export class AxiosTask<T> extends PromiseTask<T> {
  constructor(config: AxiosRequestConfig) {
    super(async task => {
      const source = axios.CancelToken.source()
      config.cancelToken = source.token
      task.once('cancel', () => source.cancel())
      const promise = axios.request<T>(config)
      promise.catch(err => {
        // consume the CANCEL error
        if (!axios.isCancel(err)) throw err
      })
      return (await promise).data
    })
  }
}
