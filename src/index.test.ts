/* tslint:disable:no-console */

import { BinaryExpression } from './sql/expr/expressions/BinaryExpression'
import { ColumnExpression } from './sql/expr/expressions/ColumnExpression'
import { FunctionExpression } from './sql/expr/expressions/FunctionExpression'
import { InExpression } from './sql/expr/expressions/InExpression'
import { MathExpression } from './sql/expr/expressions/MathExpression'
import { OrExpressions } from './sql/expr/expressions/OrExpressions'
import { Query } from './sql/query'
import { FromTable, JoinClause } from './sql/query/FromTable'
import { OrderBy } from './sql/query/OrderBy'
import { ResultColumn } from './sql/query/ResultColumn'

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

test('SELECT COUNT(*) FROM Student WHERE (id IN (SELECT studentId FROM ClubStudent `cs` LEFT JOIN Club `c` ON (c.id = cs.clubId) WHERE (c.name = \'Science Club\')))', () => {
  const query = new Query({
    $select: new ResultColumn(new FunctionExpression('COUNT', new ColumnExpression('*'))),
    $from: 'Student',
    $where: new InExpression(new ColumnExpression('id'), false, new Query({
      $select: new ResultColumn(new ColumnExpression('studentId')),
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

test('SELECT * FROM URL(GET 127.0.0.1) `Test`', () => {
  const query = new Query({
    $from: new FromTable({ table: { url: '127.0.0.1', columns: [] }, $as: 'Test' }),
  })
  query.validate()
  console.log(query.toString())
})
