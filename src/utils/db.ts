import { Expression } from '../jql/expr'
import { AndExpressions } from '../jql/expr/expressions/AndExpressions'
import { BetweenExpression } from '../jql/expr/expressions/BetweenExpression'
import { BinaryExpression } from '../jql/expr/expressions/BinaryExpression'
import { CaseExpression } from '../jql/expr/expressions/CaseExpression'
import { ExistsExpression } from '../jql/expr/expressions/ExistsExpression'
import { FunctionExpression } from '../jql/expr/expressions/FunctionExpression'
import { InExpression } from '../jql/expr/expressions/InExpression'
import { IsNullExpression } from '../jql/expr/expressions/IsNullExpression'
import { LikeExpression } from '../jql/expr/expressions/LikeExpression'
import { MathExpression } from '../jql/expr/expressions/MathExpression'
import { OrExpressions } from '../jql/expr/expressions/OrExpressions'
import { ParameterExpression } from '../jql/expr/expressions/ParameterExpression'
import { Phrase } from '../jql/expr/expressions/Phrase'
import { QueryExpression } from '../jql/expr/expressions/QueryExpression'
import { RegexpExpression } from '../jql/expr/expressions/RegexpExpression'
import { Query } from '../jql/query'

export function setDatabase(query: Query, database: string) {
  for (const { expression } of query.$select) {
    setDatabase_(expression, database)
  }
  for (const fromTable of query.$from || []) {
    if (typeof fromTable.table === 'string') {
      fromTable.database = database
    }
    else {
      setDatabase(fromTable.table, database)
    }
    for (const joinClause of fromTable.joinClauses || []) {
      joinClause.table.database = database
    }
  }
  if (query.$where) setDatabase_(query.$where, database)
  if (query.$group) {
    for (const expression of query.$group.expressions) {
      setDatabase_(expression, database)
    }
    if (query.$group.$having) setDatabase_(query.$group.$having, database)
  }
  for (const orderBy of query.$order || []) {
    setDatabase_(orderBy.expression, database)
  }
}

function setDatabase_(expression: Expression, database: string) {
  if (expression instanceof AndExpressions || expression instanceof OrExpressions || expression instanceof Phrase) {
    for (const expr of expression.expressions) {
      setDatabase_(expr, database)
    }
  }
  else if (expression instanceof BetweenExpression) {
    setDatabase_(expression.left, database)
    setDatabase_(expression.start, database)
    setDatabase_(expression.end, database)
  }
  else if (expression instanceof BinaryExpression || expression instanceof MathExpression) {
    setDatabase_(expression.left, database)
    setDatabase_(expression.right, database)
  }
  else if (expression instanceof CaseExpression) {
    for (const { $when, $then } of expression.cases) {
      setDatabase_($when, database)
      setDatabase_($then, database)
    }
    if (expression.$else) setDatabase_(expression.$else, database)
  }
  else if (expression instanceof ExistsExpression) {
    setDatabase_(expression.query, database)
  }
  else if (expression instanceof FunctionExpression) {
    for (const expr of expression.parameters) {
      setDatabase_(expr, database)
    }
  }
  else if (expression instanceof InExpression) {
    setDatabase_(expression.right, database)
  }
  else if (expression instanceof IsNullExpression || expression instanceof LikeExpression || expression instanceof RegexpExpression) {
    setDatabase_(expression.left, database)
  }
  else if (expression instanceof ParameterExpression) {
    setDatabase_(expression.expression, database)
  }
  else if (expression instanceof QueryExpression) {
    setDatabase(expression.query, database)
  }
}