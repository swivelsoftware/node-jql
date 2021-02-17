/* tslint:disable:no-console */

import { BinaryExpression, ColumnExpression, FromTable, FunctionExpression, GroupBy, InExpression, JoinClause, MathExpression, OrderBy, OrExpressions, Query, RegexpExpression, ResultColumn, Type } from '.'

test('SELECT * FROM Student', () => {
  const query = new Query('Student')
  query.validate()
  console.log(query.toString())
})

test('SELECT * FROM Student WHERE (gender = \'F\') ORDER BY id ASC', () => {
  const query = new Query({
    $from: 'Student',
    $where: new BinaryExpression(new ColumnExpression('gender'), '=', 'F'),
    $order: new OrderBy('id'),
  })
  query.validate()
  console.log(query.toString())
})

test('SELECT * FROM Student WHERE (gender = \'M\' AND (id = \'ABC\' OR name = \'ABC\'))', () => {
  const query = new Query({
    $from: 'Student',
    $where: [
      new BinaryExpression(new ColumnExpression('gender'), '=', 'M'),
      new OrExpressions([
        new BinaryExpression(new ColumnExpression('id'), '=', 'ABC'),
        new BinaryExpression(new ColumnExpression('name'), '=', 'ABC'),
      ]),
    ],
  })
  query.validate()
  console.log(query.toString())
})

test('SELECT c.name FROM Student `s` LEFT JOIN Class `c` ON (c.studentId = s.id) WHERE (s.name = \'Kennys Ng\') ORDER BY c.year DESC LIMIT 1', () => {
  const query = new Query({
    $select: new ResultColumn(new ColumnExpression('c', 'name')),
    $from: new FromTable('Student', 's', new JoinClause('LEFT', new FromTable('Class', 'c'), new BinaryExpression(new ColumnExpression('c', 'studentId'), '=', new ColumnExpression('s', 'id')))),
    $where: new BinaryExpression(new ColumnExpression('s', 'name'), '=', 'Kennys Ng'),
    $order: new OrderBy(new ColumnExpression('c', 'year'), 'DESC'),
    $limit: 1,
  })
  query.validate()
  console.log(query.toString())
})

test('SELECT COUNT(*) FROM Student WHERE (id IN (1, 2, 3))', () => {
  const query = new Query({
    $select: new ResultColumn(new FunctionExpression('COUNT', new ColumnExpression('*'))),
    $from: 'Student',
    $where: new InExpression(new ColumnExpression('id'), false, [1, 2, 3]),
  })
  query.validate()
  console.log(query.toString())
})

test('SELECT COUNT(*) FROM Student WHERE (id IN (SELECT studentId FROM ClubStudent `cs` LEFT JOIN Club `c` ON (c.id = cs.clubId) WHERE (c.name = \'Science Club\')))', () => {
  const query = new Query({
    $select: new ResultColumn(new FunctionExpression('COUNT', new ColumnExpression('*'))),
    $from: 'Student',
    $where: new InExpression(new ColumnExpression('id'), false, new Query({
      $select: new ResultColumn('studentId'),
      $from: new FromTable('ClubStudent', 'cs', new JoinClause('LEFT', new FromTable('Club', 'c'), new BinaryExpression(new ColumnExpression('c', 'id'), '=', new ColumnExpression('cs', 'clubId')))),
      $where: new BinaryExpression(new ColumnExpression('c', 'name'), '=', 'Science Club'),
    })),
  })
  query.validate()
  console.log(query.toString())
})

test('SELECT (1 + 1)', () => {
  const query = new Query({
    $select: new ResultColumn(new MathExpression(1, '+', 1)),
  })
  query.validate()
  console.log(query.toString())
})

test('Empty function', () => {
  const query = new Query({
    $select: [
      new ResultColumn(new ColumnExpression('c', 'className'), 'class'),
      new ResultColumn(new FunctionExpression('ROWS'), 'students'),
    ],
    $from: new FromTable('Student', 's', new JoinClause('LEFT', new FromTable('Class', 'c'), new BinaryExpression(new ColumnExpression('s', 'id'), '=', new ColumnExpression('c', 'studentId')))),
    $group: new GroupBy(new ColumnExpression('c', 'className')),
    $order: new OrderBy(new ColumnExpression('c', 'className')),
  })
  query.validate()
  console.log(query.toString())
})

test('RegexpExpression use case 1', () => {
  const query = new Query({
    $from: 'Student',
    $where: new RegexpExpression(new ColumnExpression('name'), false, /Kennys/gi),
  })
  query.validate()
  console.log(query.toString())
})

test('RegexpExpression use case 2', () => {
  const query = new Query({
    $from: 'Student',
    $where: new RegexpExpression(new ColumnExpression('name'), false, 'Kennys'),
  })
  query.validate()
  console.log(query.toString())
})
