import { ICursor } from './cursor/base'
import { IntermediateResultSet, ResultSet } from './cursor/resultset'
import { TableCursor, TablesCursor } from './cursor/table'
import { CompiledBetweenExpression } from './sql/expression/between'
import { CompiledBinaryExpression } from './sql/expression/binary'
import { CompiledCaseExpression } from './sql/expression/case'
import { CompiledColumnExpression } from './sql/expression/column'
import { CompiledExpression } from './sql/expression/core'
import { CompiledExistsExpression } from './sql/expression/exists'
import { CompiledFunctionExpression } from './sql/expression/function'
import { CompiledGroupedExpressions } from './sql/expression/grouped'
import { CompiledInExpression } from './sql/expression/in'
import { CompiledIsNullExpression } from './sql/expression/isNull'
import { CompiledLikeExpression } from './sql/expression/like'
import { CompiledUnknownExpression } from './sql/expression/unknown'
import { CompiledValueExpression } from './sql/expression/value'
import { CompiledQuery } from './sql/query/core'
import { Transaction, Variable } from './transaction'

export class Sandbox extends Transaction {
  constructor(transaction: Transaction, private query: CompiledQuery) {
    super(transaction)
  }

  public defineVariable(name: string, value: CompiledQuery|Variable): Sandbox {
    if (value instanceof CompiledQuery) {
      value = super.runQuery(value)
    }
    super.defineVariable(name, value)
    return this
  }

  public runQuery(): ResultSet {
    const cursor = new TablesCursor(this.query.$from.map((tableOrSubquery) => new TableCursor(this, tableOrSubquery)))

    const resultset = new IntermediateResultSet()
    while (cursor.next()) {
      if (!this.query.$where || this.evaluate(this.query.$where, cursor)) {
        // add row
        resultset.nextRow()

        // columns to be shown
        for (const { expression, symbol } of this.query.$select) {
          resultset.set(symbol, this.evaluate(expression, cursor))
        }

        // columns for ordering
        for (const { expression, symbol } of this.query.$order) {
          resultset.set(symbol, this.evaluate(expression, cursor))
        }
      }
    }

    // TODO group by

    // order by
    resultset.sort((l, r) => {
      for (const { order, symbol } of this.query.$order) {
        if (l[symbol] < r[symbol]) return order === 'DESC' ? 1 : -1
        if (l[symbol] > r[symbol]) return order === 'DESC' ? -1 : 1
      }
      return 0
    })

    return resultset.commit(this.query.resultsetSchema, this.query.$limit)
  }

  public evaluate(expression: CompiledExpression, cursor: ICursor): any {
    if (expression instanceof CompiledBetweenExpression) {
      const left = this.evaluate(expression.left, cursor)
      const start = this.evaluate(expression.start, cursor)
      const end = this.evaluate(expression.end, cursor)
      let result = start <= left && left <= end
      if (expression.$not) result = !result
      return result
    }
    else if (expression instanceof CompiledBinaryExpression) {
      const left = this.evaluate(expression.left, cursor)
      const right = this.evaluate(expression.right, cursor)
      switch (expression.operator) {
        case '<':
          return left < right
        case '<=':
          return left <= right
        case '<>':
          return left !== right
        case '=':
          return left === right
        case '>':
          return left > right
        case '>=':
          return left >= right
      }
    }
    else if (expression instanceof CompiledCaseExpression) {
      for (const { $when, $then } of expression.cases) {
        if (this.evaluate($when, cursor)) {
          return this.evaluate($then, cursor)
        }
      }
      if (expression.$else) this.evaluate(expression.$else, cursor)
    }
    else if (expression instanceof CompiledColumnExpression) {
      return cursor.get(expression.column.symbol)
    }
    else if (expression instanceof CompiledExistsExpression) {
      let result = new Sandbox(this, expression.query).runQuery().length > 0
      if (expression.$not) result = !result
      return result
    }
    else if (expression instanceof CompiledFunctionExpression) {
      const parameters = expression.parameters.map((expression) => this.evaluate(expression, cursor))
      return expression.jqlFunction.run(...parameters)
    }
    else if (expression instanceof CompiledGroupedExpressions) {
      return expression.expressions.reduce((result, expression_) => {
        return expression.operator === 'AND'
          ? result && this.evaluate(expression_, cursor)
          : result || this.evaluate(expression_, cursor)
      }, false)
    }
    else if (expression instanceof CompiledInExpression) {
      const left = this.evaluate(expression.left, cursor)
      let right: any[]
      if (expression.right instanceof CompiledQuery) {
        const resultset = new Sandbox(this, expression.right).runQuery()
        right = []
        while (resultset.next()) right.push(resultset.get(0))
      }
      else {
        right = expression.right.value
      }
      return right.indexOf(left) > -1
    }
    else if (expression instanceof CompiledIsNullExpression) {
      const left = this.evaluate(expression.left, cursor)
      let result = left === null || left === undefined
      if (expression.$not) result = !result
      return result
    }
    else if (expression instanceof CompiledLikeExpression) {
      const left = this.evaluate(expression.left, cursor)
      let right = this.evaluate(expression.right, cursor) as RegExp|string
      if (!(right instanceof RegExp)) right = new RegExp(right)
      let result = right.test(left)
      if (expression.$not) result = !result
      return result
    }
    else if (expression instanceof CompiledUnknownExpression || expression instanceof CompiledValueExpression) {
      return expression.value
    }
  }
}
