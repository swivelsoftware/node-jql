import squel from 'squel'
import { JQL } from '..'
import { IJQL } from '../interface'
import { isParseable, parseJQL } from '../parse'
import { Query } from '../query'
import { IPredictJQL } from './interface'

/**
 * JQL class for PREDICT SELECT ...
 */
export class PredictJQL extends JQL implements IPredictJQL {
  public jql: JQL[]

  /**
   * @param jql [Array<IJQL>]
   */
  constructor(...jql: IJQL[]) {
    super()
    this.jql = jql.map(jql => {
      if (isParseable(jql)) return parseJQL(jql)
      throw new SyntaxError(`Invalid JQL: ${JSON.stringify(jql)}`)
    })
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
