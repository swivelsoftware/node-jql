import { JQLError } from '../../../utils/error'
import { JQLFunction } from '../../function/base'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression } from './core'
import { parseExpression } from './utils'

export interface IFunctionExpression {
  name: string
  parameters?: any[]|any
}

export class FunctionExpression extends Expression implements IFunctionExpression {
  public readonly classname: string = 'FunctionExpression'
  public name: string
  public parameters: Expression[]

  constructor(json: IFunctionExpression) {
    super()
    this.name = json.name

    try {
      let parameters = json.parameters || []
      if (!Array.isArray(parameters)) parameters = [parameters]
      this.parameters = parameters.map((parameter) => parseExpression(parameter))
    }
    catch (e) {
      throw new JQLError('Fail to instantiate FunctionExpression', e)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledFunctionExpression {
    return new CompiledFunctionExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledFunctionExpression extends CompiledExpression {
  public readonly jqlFunction: JQLFunction<any>
  public readonly parameters: CompiledExpression[]

  constructor(transaction: Transaction, options: ICompileSqlOptions<FunctionExpression>) {
    super(transaction, options)
    try {
      this.jqlFunction = transaction.getFunction(options.parent.name)
      this.parameters = options.parent.parameters.map((parameter) => parameter.compile(transaction, options))
    }
    catch (e) {
      throw new JQLError('Fail to compile FunctionExpression', e)
    }
  }
}
