/* tslint:disable:no-console */
import { AndExpressions, BetweenExpression, BinaryExpression, CaseExpression, ColumnDef, ColumnExpression, CreateFunctionJQL, CreateSchemaJQL, CreateSchemaTableJQL, DeleteJQL, DropFunctionJQL, DropSchemaJQL, DropTableJQL, ExistsExpression, FromTable, FunctionExpression, InExpression, IsNullExpression, LikeExpression, LimitBy, MathExpression, OrderBy, Query, QueryExpression, RegexpExpression, ResultColumn, SchemaTable, SetVariableExpression, SetVariableJQL, Unknown, Value, Variable } from '.'

test('BetweenExpression', () => {
  const expr = new BetweenExpression()
    .setLeft(new ColumnExpression('jobDate'))
    .setNot()
    .setStart(new Unknown('date'))
    .setEnd(new Unknown('date'))
  console.log(`BetweenExpression: ${expr.toString()}`)
})

test('BinaryExpression', () => {
  const expr = new BinaryExpression('=')
    .setLeft(new ColumnExpression('customerId'))
    .setRight(new Value(49))
  console.log(`BinaryExpression: ${expr.toString()}`)
})

test('CaseExpression', () => {
  const expr = new CaseExpression()
    .addCase(
      new BinaryExpression('=').setLeft(new ColumnExpression('division')).setRight(new Value('AE')),
      new Value('Air Export'),
    )
    .addCase(
      new BinaryExpression('=').setLeft(new ColumnExpression('division')).setRight(new Value('AI')),
      new Value('Air Import'),
    )
    .addCase(
      new BinaryExpression('=').setLeft(new ColumnExpression('division')).setRight(new Value('SE')),
      new Value('Sea Export'),
    )
    .setElse(new Value('Sea Import'))
  console.log(`CaseExpression: ${expr.toString()}`)
})

test('ExistsExpression', () => {
  const expr = new ExistsExpression()
    .setNot()
    .setQuery(new QueryExpression(
      new Query()
        .select(new ResultColumn().setExpression(new Value('x')))
        .from(new FromTable().setTable(new SchemaTable('billSummary')))
        .where(new BinaryExpression('=').setLeft(new ColumnExpression('id')).setRight(new Value(1))),
    ))
  console.log(`ExistsExpression: ${expr.toString()}`)
})

test('FunctionExpression', () => {
  let expr = new FunctionExpression('SUM')
    .addParameter(new ColumnExpression('chargeableWeight'))
  console.log(`FunctionExpression: ${expr.toString()}`)

  expr = new FunctionExpression('ADDDATE')
    .addParameter(new ColumnExpression('jobDate'))
    .addParameter(new Value(1))
    .addParameter(new Value('DAY').setRaw())
  console.log(`FunctionExpression: ${expr.toString()}`)
})

test('GroupedExpressions', () => {
  const expr = new AndExpressions()
    .addExpression(new BinaryExpression('=').setLeft(new ColumnExpression('customerId')).setRight(new Value(49)))
    .addExpression(new BetweenExpression().setLeft(new ColumnExpression('jobDate')).setStart(new Value('2019-01-01')).setEnd(new Value('2019-12-31')))
  console.log(`GroupedExpressions: ${expr.toString()}`)
})

test('InExpression', () => {
  let expr = new InExpression()
    .setLeft(new ColumnExpression('division'))
    .setNot()
    .setRight(new Value(['AE', 'AI']))
  console.log(`InExpression: ${expr.toString()}`)

  expr = new InExpression()
    .setLeft(new ColumnExpression('division'))
    .setRight(new QueryExpression(
      new Query()
        .select(new ResultColumn('code'))
        .from(new FromTable('codeMaster'))
        .where(new BinaryExpression('=').setLeft(new ColumnExpression('codeType')).setRight(new Value('division'))),
    ))
  console.log(`InExpression: ${expr.toString()}`)
})

test('IsNullExpression', () => {
  const expr = new IsNullExpression()
    .setLeft(new ColumnExpression('deletedAt'))
    .setNot()
  console.log(`IsNullExpression: ${expr.toString()}`)
})

test('LikeExpression', () => {
  const expr = new LikeExpression()
    .setLeft(new ColumnExpression('userName'))
    .setNot()
    .setRight(new Value('kennys.ng%'))
  console.log(`LikeExpression: ${expr.toString()}`)
})

test('MathExpression', () => {
  const expr = new MathExpression('+')
    .setLeft(new ColumnExpression('chargeableWeight'))
    .setRight(new ColumnExpression('grossWeight'))
  console.log(`MathExpression: ${expr.toString()}`)
})

test('RegexpExpression', () => {
  const expr = new RegexpExpression()
    .setLeft(new ColumnExpression('userName'))
    .setNot()
    .setRight(new Value('kennys.ng'))
  console.log(`RegexpExpression: ${expr.toString()}`)
})

test('Set Variable', () => {
  const jql = new SetVariableJQL()
    .setExpression(new SetVariableExpression('var1').setRight(new Value(1)))
  console.log(`Set Variable: ${jql.toString()}`)
})

test('Query', () => {
  let query = new Query()
    .setDistinct()
    .from(new FromTable().setTable(new SchemaTable('billSummary').setAlias('b')))
    .where(new BinaryExpression('=').setLeft(new ColumnExpression('customerId')).setRight(new Value(49)))
    .orderBy(new OrderBy().setExpression(new ColumnExpression('id'), 'DESC'))
    .limitBy(new LimitBy().setLimit(20).setOffset(20))
  console.log(`Query: ${query.toString()}`)

  query = new Query()
    .select(new ResultColumn().setExpression(new FunctionExpression('count').addParameter(new ColumnExpression('*').setDistinct())).setAs('count'))
    .from(new FromTable('billSummary'))
    .groupBy(new ColumnExpression('moduleType'))
    .having(new BinaryExpression('>').setLeft(new ColumnExpression('count')).setRight(new Unknown('number')))
  console.log(`Query: ${query.toString()}`)

  query = new Query()
    .select(new ResultColumn().setExpression(new Variable('var1')))
  console.log(`Query: ${query.toString()}`)
})

test('Create Schema', () => {
  const jql = new CreateSchemaJQL('TEMP_DB').ifNotExists()
  console.log(`Create Schema: ${jql.toString()}`)
})

test('Create Table', () => {
  const jql = new CreateSchemaTableJQL('TEMP_TABLE').ifNotExists()
  .addColumn(new ColumnDef().setColumn('id', 'number').setPrimaryKey().setAutoIncrement())
  .addColumn(new ColumnDef().setColumn('name', 'string').setNotNull())
  console.log(`Create Table: ${jql.toString()}`)
})

test('Create Function', () => {
  const jql = new CreateFunctionJQL('plus')
    .addParameter('a', 'number')
    .addParameter('b', 'number')
    .setReturnType('number')
    .setCode('return a + b')
  console.log(`Create Function: ${jql.toString()}`)
})

test('Drop Function', () => {
  const jql = new DropFunctionJQL('plus').ifExists()
  console.log(`Drop Function: ${jql.toString()}`)
})

test('Delete From Table', () => {
  const jql = new DeleteJQL('TEMP_TABLE')
    .where(new BinaryExpression('=').setLeft(new ColumnExpression('id')).setRight(new Value(1)))
  console.log(`Delete From Table: ${jql.toString()}`)
})

test('Drop Table', () => {
  let jql = new DropTableJQL('TEMP_TABLE').ifExists()
  console.log(`Drop Table: ${jql.toString()}`)

  jql = new DropTableJQL().setTable(new SchemaTable().setTable('TEMP_DB', 'TEMP_TABLE'))
  console.log(`Drop Table: ${jql.toString()}`)
})

test('Drop Schema', () => {
  const jql = new DropSchemaJQL('TEMP_DB').ifExists()
  console.log(`Drop Schema: ${jql.toString()}`)
})
