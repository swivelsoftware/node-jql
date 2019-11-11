/**
 * JQL error codes
 */
export const ERROR_CODES = {
  UNKNOWN: 0x000000,
  ALREADY_EXISTS: 0x000001,
  NOT_EXISTS: 0x000002,
  NOT_SUPPORTED: 0x000003,
  CLOSED: 0xFFFFFD,
  CANCELED: 0xFFFFFE,
  FATAL: 0xFFFFFF,
}

/**
 * JQL error
 */
export class JQLError extends Error {
  constructor(
    /**
     * Error code
     */
    public readonly code: number,
    message?: string,
  ) {
    super(message)
  }
}
