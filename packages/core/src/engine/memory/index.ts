import { Engine } from '..'
import { Context } from './context'

/**
 * In-memory SQL database engine
 */
export class MemoryEngine extends Engine {
  /**
   * Database context
   */
  protected context = new Context()

  constructor(
    /**
     * Schema name
     */
    public name: string,
  ) {
    super()
  }
}
