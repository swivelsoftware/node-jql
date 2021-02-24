import squel from 'squel'
import { Expression } from '..'
import { IFunctionExpression } from '../interface'
import { parseExpr } from '../parse'
import { CaseExpression } from './CaseExpression'
import { ColumnExpression } from './ColumnExpression'
import { ParameterExpression } from './ParameterExpression'

/**
 * JQL class defining function expression
 */
export class FunctionExpression extends Expression implements IFunctionExpression {
  public readonly classname = FunctionExpression.name
  public name: string
  public parameters: ParameterExpression[]

  /**
   * @param json [Partial<IFunctionExpression>]
   */
  constructor(json: Partial<IFunctionExpression>)

  /**
   * @param name [string]
   * @param parameters [Array] optional
   */
  constructor(name: string, ...parameters: any[])

  constructor(...args: any[]) {
    super()

    // parse args
    let name: string, parameters: any[]
    if (typeof args[0] === 'object') {
      const json = args[0] as IFunctionExpression
      name = json.name
      json.parameters = json.parameters || []
      parameters = Array.isArray(json.parameters) ? json.parameters : [json.parameters]
    }
    else {
      name = args[0]
      parameters = args.slice(1)
    }

    // check args
    if (!name) throw new SyntaxError('Missing function name')

    // set args
    this.name = name.toLocaleUpperCase()
    this.parameters = parameters.map(parameter => {
      let expression = parseExpr(parameter)
      if (!(expression instanceof ParameterExpression)) expression = new ParameterExpression({ expression })
      return expression as ParameterExpression
    })
  }

  /**
   * Whether it is a simple count function COUNT(*)
   */
  get isSimpleCount(): boolean {
    return this.name === 'COUNT' && !this.parameters[0].prefix && this.parameters[0].expression instanceof ColumnExpression && !this.parameters[0].expression.table && this.parameters[0].expression.isWildcard
  }

  // @override
  public validate(availableTables: string[]): void {
    for (const parameter of this.parameters) parameter.validate(availableTables)
  }

  // @override
  public toSquel(type: squel.Flavour = 'mysql', options?: any): squel.Expression | squel.FunctionBlock {
    const squel_ = squel.useFlavour(type as any)
    let name = this.name.toLocaleUpperCase()
    switch (type) {
      case 'mssql': {
        switch (name) {
          case 'IF': {
            return new CaseExpression(
              [{
                $when: this.parameters[0].expression,
                $then: this.parameters[1].expression,
              }],
              this.parameters[2] && this.parameters[2].expression
            ).toSquel(type, options)
          }
          case 'IFNULL': {
            name = 'ISNULL'
          }
        }
      }
      case 'mysql':
      default: {
        return squel_.rstr(
          `${name}(${this.parameters.map(() => '?').join(', ')})`,
          ...this.parameters.map(parameter => parameter.toSquel(type, options)),
        )
      }
    }
  }

  // @override
  public toJson(): IFunctionExpression {
    const result: IFunctionExpression = {
      classname: this.classname,
      name: this.name,
    }
    if (this.parameters.length > 0) result.parameters = this.parameters.map(expression => expression.toJson())
    return result
  }
}
