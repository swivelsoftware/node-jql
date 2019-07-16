import squel from 'squel'
import './jql/expr/expressions'
import './jql/squel'

// @ts-ignore
squel.useFlavour('node-jql')

// utils
export { checkNull, equals } from './utils/check'
export { JQLError } from './utils/error'
// type
export { Type, defaults, type, normalize, denormalize } from './type'
// jql
export { IJQL } from './jql/interface'
export { JQL } from './jql'
export { parseJQL, isParseable } from './jql/parse'
// jql/expr
export { IExpression, IConditionalExpression, IGroupedExpressions, IBetweenExpression, BinaryOperator, IBinaryExpression, ICase, ICaseExpression, IColumnExpression, IExistsExpression, IFunctionExpression, IInExpression, IIsNullExpression, ILikeExpression, MathOperator, IMathExpression, IParameterExpression, IUnknown, IValue } from './jql/expr/interface'
export { Expression, ConditionalExpression } from './jql/expr'
export { AndExpressions } from './jql/expr/expressions/AndExpressions'
export { BetweenExpression } from './jql/expr/expressions/BetweenExpression'
export { BinaryExpression } from './jql/expr/expressions/BinaryExpression'
export { CaseExpression } from './jql/expr/expressions/CaseExpression'
export { ColumnExpression } from './jql/expr/expressions/ColumnExpression'
export { ExistsExpression } from './jql/expr/expressions/ExistsExpression'
export { FunctionExpression } from './jql/expr/expressions/FunctionExpression'
export { InExpression } from './jql/expr/expressions/InExpression'
export { IsNullExpression } from './jql/expr/expressions/IsNullExpression'
export { LikeExpression } from './jql/expr/expressions/LikeExpression'
export { MathExpression } from './jql/expr/expressions/MathExpression'
export { ParameterExpression } from './jql/expr/expressions/ParameterExpression'
export { OrExpressions } from './jql/expr/expressions/OrExpressions'
export { Unknown } from './jql/expr/expressions/Unknown'
export { Value } from './jql/expr/expressions/Value'
// jql/query
export { IQuery, IResultColumn, IFromTable, JoinOperator, IJoinClause, IGroupBy, IOrderBy, ILimitOffset } from './jql/query/interface'
export { Query } from './jql/query'
export { ResultColumn } from './jql/query/ResultColumn'
export { JoinClause, FromTable } from './jql/query/FromTable'
export { GroupBy } from './jql/query/GroupBy'
export { OrderBy } from './jql/query/OrderBy'
export { LimitOffset } from './jql/query/LimitOffset'
// jql/create
export { ICreateJQL, IColumn, ICreateDatabaseJQL, ICreateTableJQL, ICreateFunctionJQL } from './jql/create/interface'
export { CreateJQL } from './jql/create'
export { Column } from './jql/create/column'
export { CreateDatabaseJQL } from './jql/create/database'
export { CreateTableJQL } from './jql/create/table'
export { CreateFunctionJQL } from './jql/create/function'
// jql/drop
export { IDropJQL, IDropDatabaseJQL, IDropTableJQL, IDropFunctionJQL } from './jql/drop/interface'
export { DropJQL } from './jql/drop'
export { DropDatabaseJQL } from './jql/drop/database'
export { DropTableJQL } from './jql/drop/table'
export { DropFunctionJQL } from './jql/drop/function'
// jql/insert
export { IInsertJQL } from './jql/insert/interface'
export { InsertJQL } from './jql/insert'
// jql/predict
export { PredictJQL } from './jql/predict'
