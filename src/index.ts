import squel from 'squel'
import './jql/squel'

// @ts-ignore
squel.useFlavour('node-jql')

// utils
export { checkNull, equals } from './utils/check'
export { JQLError } from './utils/error'

// type
export { Type, defaults, type, normalize, denormalize } from './type'

// jql
export { IJQL, JQL } from './jql'
export { parse, isParseable } from './jql/parse'

// jql/expr
export { IExpression, Expression, IConditionalExpression, ConditionalExpression } from './jql/expr'
export { IGroupedExpressions } from './jql/expr/grouped'
export { AndExpressions } from './jql/expr/expressions/AndExpressions'
export { IBetweenExpression, BetweenExpression } from './jql/expr/expressions/BetweenExpression'
export { BinaryOperator, IBinaryExpression, BinaryExpression } from './jql/expr/expressions/BinaryExpression'
export { ICase, ICaseExpression, CaseExpression } from './jql/expr/expressions/CaseExpression'
export { IColumnExpression, ColumnExpression } from './jql/expr/expressions/ColumnExpression'
export { IExistsExpression, ExistsExpression } from './jql/expr/expressions/ExistsExpression'
export { IFunctionExpression, FunctionExpression } from './jql/expr/expressions/FunctionExpression'
export { IInExpression, InExpression } from './jql/expr/expressions/InExpression'
export { IIsNullExpression, IsNullExpression } from './jql/expr/expressions/IsNullExpression'
export { ILikeExpression, LikeExpression } from './jql/expr/expressions/LikeExpression'
export { MathOperator, IMathExpression, MathExpression } from './jql/expr/expressions/MathExpression'
export { IParameterExpression, ParameterExpression } from './jql/expr/expressions/ParameterExpression'
export { OrExpressions } from './jql/expr/expressions/OrExpressions'
export { IUnknown, Unknown } from './jql/expr/expressions/Unknown'
export { IValue, Value } from './jql/expr/expressions/Value'

// jql/query
export { IQuery, Query } from './jql/query'
export { IResultColumn, ResultColumn } from './jql/query/ResultColumn'
export { IJoinClause, JoinClause, IFromTable, FromTable } from './jql/query/FromTable'
export { IGroupBy, GroupBy } from './jql/query/GroupBy'
export { IOrderBy, OrderBy } from './jql/query/OrderBy'
export { ILimitOffset, LimitOffset } from './jql/query/LimitOffset'

// jql/create
export { ICreateJQL, CreateJQL } from './jql/create'
export { IColumn, Column } from './jql/create/column'
export { ICreateDatabaseJQL, CreateDatabaseJQL } from './jql/create/database'
export { ICreateTableJQL, CreateTableJQL } from './jql/create/table'

// jql/drop
export { IDropJQL, DropJQL } from './jql/drop'
export { IDropDatabaseJQL, DropDatabaseJQL } from './jql/drop/database'
export { IDropTableJQL, DropTableJQL } from './jql/drop/table'

// jql/insert
export { IInsertJQL, InsertJQL } from './jql/insert'
