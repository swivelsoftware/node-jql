import { Expression } from '../expression'
import { IStringify } from '../index.if'

/**
 * Configurations for different DB types
 */
export interface IDBConfig {
  binaryOperators?: string[],
  mathOperators?: string[],
  functions?: {
    formats?: { [key: string]: string },
    validations?: { [key: string]: (args: Expression[]) => boolean },
  }
  stringify?: { [key: string]: (json: IStringify) => string }
}
