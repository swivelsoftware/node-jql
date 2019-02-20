import squel = require('squel')
import { parseExpression } from '..'
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { JQLFunction } from '../../../function'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, Expression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { IFunctionExpression } from './interface'

/**
 * expression `$func(...$args)`
 */
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
  public validate(tables: string[]) {
    for (const parameter of this.parameters) parameter.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledFunctionExpression {
    return new CompiledFunctionExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.str(`${this.name.toLocaleUpperCase()}(${this.parameters.map(() => '?').join(', ')})`,
      ...this.parameters.map((parameter) => parameter.toSquel()),
    )
  }
}

/**
 * compiled `FunctionExpression`
 */
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    for (const parameter of this.parameters) parameter.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): any {
    return this.jqlFunction.run(...this.parameters.map((expression) => expression.evaluate(transaction, cursor)))
  }
}
