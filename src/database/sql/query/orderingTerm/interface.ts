import { IExpression } from '../../expression/interface'

export type Order = 'ASC'|'DESC'

export interface IOrderingTerm {
  expression: IExpression
  order?: Order
}
