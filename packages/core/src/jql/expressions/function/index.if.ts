import { IExpression } from '../index.if'

/**
 * {name}({parameters})
 */
export interface IFunctionExpression extends IExpression {
  /**
   * Function name
   */
  name: string

  /**
   * Function parameters
   */
  parameters?: IExpression[]
}
