import { JQL } from '..'
import { IQuery } from './index.if'

/**
 * SELECT ... FROM ...
 */
export class Query extends JQL implements IQuery {
  // @override
  public readonly classname: string = Query.name

  constructor(json: IQuery)
  constructor(...args: any[]) {
    super()

    // TODO
  }

  // @override
  public toJson(): IQuery {
    // TODO
  }
}
