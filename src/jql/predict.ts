import squel = require('squel')
import { IJQL, JQL } from '.'
import { Query } from './query'

interface IPredictJQL extends IJQL {
  jql: IJQL[]
}

/**
 * JQL class for PREDICT SELECT ...
 */
export class PredictJQL extends JQL implements IPredictJQL {
  public jql: JQL[]

  /**
   * @param jql [Array<JQL>]
   */
  constructor(...jql: JQL[]) {
    super()
    this.jql = jql
    if (!(this.jql[this.jql.length - 1] instanceof Query)) throw new SyntaxError('The last statement must be a Query for prediction')
  }

  // validate()
  public validate(availableTables: string[] = []): void {
    for (const jql of this.jql) jql.validate(availableTables)
  }

  // @override
  public toSquel(): squel.BaseBuilder {
    const builder = squel['predict']()
    for (const jql of this.jql) builder['statement'](jql.toSquel())
    return builder
  }

  // @override
  public toJson(): IPredictJQL {
    return { jql: this.jql }
  }
}
