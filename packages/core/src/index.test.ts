/* tslint:disable:no-console */
import { AndExpressions, BetweenExpression, BinaryExpression, CaseExpression, ColumnExpression, DatabaseTable, FromTable, FunctionExpression, InExpression, IsNullExpression, LikeExpression, MathExpression, OrderBy, Query, QueryExpression, RegexpExpression, ResultColumn, Unknown, Value } from '.'
import { ExistsExpression } from './jql/expressions/exists'
import { LimitBy } from './jql/select/limitBy'

test('BetweenExpression', () => {
  const expr = new BetweenExpression()
    .setLeft(new ColumnExpression().setColumn('jobDate'))
    .setNot()
    .setStart(new Unknown().setType('date'))
    .setEnd(new Unknown().setType('date'))
  console.log(`BetweenExpression: ${expr.toString()}`)
})

test('BinaryExpression', () => {
  const expr = new BinaryExpression()
    .setLeft(new ColumnExpression().setColumn('customerId'))
    .setOperator('=')
    .setRight(new Value(49))
  console.log(`BinaryExpression: ${expr.toString()}`)
})

test('CaseExpression', () => {
  const expr = new CaseExpression()
    .addCase(
      new BinaryExpression().setLeft(new ColumnExpression().setColumn('division')).setOperator('=').setRight(new Value('AE')),
      new Value('Air Export'),
    )
    .addCase(
      new BinaryExpression().setLeft(new ColumnExpression().setColumn('division')).setOperator('=').setRight(new Value('AI')),
      new Value('Air Import'),
    )
    .addCase(
      new BinaryExpression().setLeft(new ColumnExpression().setColumn('division')).setOperator('=').setRight(new Value('SE')),
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
        .from(new FromTable().setTable(new DatabaseTable().setTable('billSummary')))
        .where(new BinaryExpression().setLeft(new ColumnExpression().setColumn('id')).setOperator('=').setRight(new Value(1))),
    ))
  console.log(`ExistsExpression: ${expr.toString()}`)
})

test('FunctionExpression', () => {
  let expr = new FunctionExpression()
    .setFunction('SUM')
    .addParameter(new ColumnExpression().setColumn('chargeableWeight'))
  console.log(`FunctionExpression: ${expr.toString()}`)

  expr = new FunctionExpression()
    .setFunction('ADDDATE')
    .addParameter(new ColumnExpression().setColumn('jobDate'))
    .addParameter(new Value(1))
    .addParameter(new Value('DAY').setRaw())
  console.log(`FunctionExpression: ${expr.toString()}`)
})

test('GroupedExpressions', () => {
  const expr = new AndExpressions()
    .addExpression(new BinaryExpression().setLeft(new ColumnExpression().setColumn('customerId')).setOperator('=').setRight(new Value(49)))
    .addExpression(new BetweenExpression().setLeft(new ColumnExpression().setColumn('jobDate')).setStart(new Value('2019-01-01')).setEnd(new Value('2019-12-31')))
  console.log(`GroupedExpressions: ${expr.toString()}`)
})

test('InExpression', () => {
  let expr = new InExpression()
    .setLeft(new ColumnExpression().setColumn('division'))
    .setNot()
    .setRight(new Value(['AE', 'AI']))
  console.log(`InExpression: ${expr.toString()}`)

  expr = new InExpression()
    .setLeft(new ColumnExpression().setColumn('division'))
    .setRight(new QueryExpression(
      new Query()
        .select(new ResultColumn().setExpression(new ColumnExpression().setColumn('code')))
        .from(new FromTable().setTable(new DatabaseTable().setTable('codeMaster')))
        .where(new BinaryExpression().setLeft(new ColumnExpression().setColumn('codeType')).setOperator('=').setRight(new Value('division'))),
    ))
  console.log(`InExpression: ${expr.toString()}`)
})

test('IsNullExpression', () => {
  const expr = new IsNullExpression()
    .setLeft(new ColumnExpression().setColumn('deletedAt'))
    .setNot()
  console.log(`IsNullExpression: ${expr.toString()}`)
})

test('LikeExpression', () => {
  const expr = new LikeExpression()
    .setLeft(new ColumnExpression().setColumn('userName'))
    .setNot()
    .setRight(new Value('kennys.ng%'))
  console.log(`LikeExpression: ${expr.toString()}`)
})

test('MathExpression', () => {
  const expr = new MathExpression()
    .setLeft(new ColumnExpression().setColumn('chargeableWeight'))
    .setOperator('+')
    .setRight(new ColumnExpression().setColumn('grossWeight'))
  console.log(`MathExpression: ${expr.toString()}`)
})

test('RegexpExpression', () => {
  const expr = new RegexpExpression()
    .setLeft(new ColumnExpression().setColumn('userName'))
    .setNot()
    .setRight(new Value('kennys.ng'))
  console.log(`RegexpExpression: ${expr.toString()}`)
})

test('Query', () => {
  let query = new Query()
    .setDistinct()
    .from(new FromTable().setTable(new DatabaseTable().setTable('billSummary').setAlias('b')))
    .where(new BinaryExpression().setLeft(new ColumnExpression().setColumn('customerId')).setOperator('=').setRight(new Value(49)))
    .orderBy(new OrderBy().setExpression(new ColumnExpression().setColumn('id'), 'DESC'))
    .limitBy(new LimitBy().setLimit(20).setOffset(20))
  console.log(`Query: ${query.toString()}`)

  query = new Query()
    .select(new ResultColumn().setExpression(new FunctionExpression().setFunction('count').addParameter(new ColumnExpression().setColumn('*').setDistinct())).setAs('count'))
    .from(new FromTable().setTable(new DatabaseTable().setTable('billSummary')))
    .groupBy(new ColumnExpression().setColumn('moduleType'))
    .having(new BinaryExpression().setLeft(new ColumnExpression().setColumn('count')).setOperator('>').setRight(new Unknown()))
  console.log(`Query: ${query.toString()}`)
})
