import { IConditionalExpression, IExpression } from '../../expression/interface'

export interface IGroupBy {
  expressions: IExpression[]|IExpression
  $having?: IConditionalExpression[]|IConditionalExpression
}
