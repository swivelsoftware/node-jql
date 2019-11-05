/**
 * Engine options
 */
export interface IEngineOptions {
  /**
   * Controls the frequency of read-write lock check
   */
  lockCheckInterval?: number

  /**
   * Controls the number of simultaneous read processes
   */
  maxSimultaneousRead?: number
}
