import { IExpression } from '../index.if'

/**
 * {name}({parameters})
 */
export interface IFunctionExpression extends IExpression {
  name: string
  parameters?: IExpression[]
}
