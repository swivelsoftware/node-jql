/* tslint:disable:no-console */
import { AndExpressions, BetweenExpression, BinaryExpression, CaseExpression, ColumnExpression, FunctionExpression, InExpression, IsNullExpression, LikeExpression, MathExpression, RegexpExpression, Unknown, Value } from '.'

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

// TODO ExistsExpression

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
  const expr = new InExpression()
    .setLeft(new ColumnExpression().setColumn('division'))
    .setNot()
    .setRight(new Value(['AE', 'AI']))
  console.log(`InExpression: ${expr.toString()}`)

  // TODO setRight(QueryExpression)
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

// TODO QueryExpression

test('RegexpExpression', () => {
  const expr = new RegexpExpression()
    .setLeft(new ColumnExpression().setColumn('userName'))
    .setNot()
    .setRight(new Value('kennys.ng'))
  console.log(`RegexpExpression: ${expr.toString()}`)
})
