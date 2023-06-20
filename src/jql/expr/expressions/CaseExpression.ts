import squel from 'squel'
import { ConditionalExpression, Expression } from '..'
import { ICase, ICaseExpression, IExpression } from '../interface'
import { parseExpr } from '../parse'

/**
 * JQL class for `CASE {cases} ELSE {$else}`
 */
export class CaseExpression extends Expression implements ICaseExpression {
  public readonly classname = CaseExpression.name
  public expression?: Expression
  public cases: Array<{ $when: ConditionalExpression, $then: Expression }>
  public $else?: Expression

  /**
   * @param json [Partial<ICaseExpression>]
   */
  constructor(json: Partial<ICaseExpression>)

  /**
   * @param cases [Array<ICase>]
   * @param $else [IExpression] optional
   */
  constructor(cases: ICase[], $else?: IExpression)

  /**
   * @param expression [IExpression]
   * @param cases [Array<ICase>]
   * @param $else [IExpression] optional
   */
  constructor(expression: Expression, cases: ICase[], $else?: IExpression)

  constructor(...args: any[]) {
    super()

    // parse args
    let expression: IExpression|undefined, cases: ICase[], $else: IExpression|undefined
    if (!Array.isArray(args[0]) && !Array.isArray(args[1])) {
      const json = args[0] as ICaseExpression
      expression = json.expression
      cases = Array.isArray(json.cases) ? json.cases : [json.cases]
      $else = json.$else
    }
    else if (Array.isArray(args[1])) {
      expression = args[0]
      cases = args[1]
      $else = args[2]
    }
    else {
      cases = args[0]
      $else = args[1]
    }

    // check args
    if (!cases.length) throw new SyntaxError('Missing cases. There must be at lease 1 case')

    // set args
    if (expression) this.expression = parseExpr(expression)
    this.cases = cases.map(({ $when, $then }) => ({ $when: parseExpr($when), $then: parseExpr($then) }))
    if ($else) this.$else = parseExpr($else)
  }

  // @override
  public validate(availableTables: string[]): void {
    if (this.expression) this.expression.validate(availableTables)
    for (const { $when, $then } of this.cases) {
      $when.validate(availableTables)
      $then.validate(availableTables)
    }
    if (this.$else) this.$else.validate(availableTables)
  }

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.Expression {
    const squel_ = squel.useFlavour(type as any)
    const params = [] as any[]
    if (this.expression) params.push(this.expression.toSquel(type, options))
    this.cases.forEach(({ $when, $then }) => params.push($when.toSquel(type, options), $then.toSquel(type, options)))
    if (this.$else) params.push(this.$else.toSquel(type, options))
    return squel_.expr().and(`CASE ${this.expression ? '? ' : ''}${this.cases.map(() => 'WHEN ? THEN ?').join(' ')}${this.$else ? ' ELSE ?' : ''} END`, ...params)
  }

  // @override
  public toJson(): ICaseExpression {
    const result: ICaseExpression = {
      classname: this.classname,
      cases: this.cases.map(({ $when, $then }) => ({ $when: $when.toJson(), $then: $then.toJson() })),
    }
    if (this.expression) result.expression = this.expression.toJson()
    if (this.$else) result.$else = this.$else.toJson()
    return result
  }
}
