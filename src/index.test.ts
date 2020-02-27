/* tslint:disable:no-console */

import moment from 'moment'
import { BinaryExpression, Column, ColumnExpression, CreateDatabaseJQL, CreateTableJQL, DropDatabaseJQL, DropTableJQL, FromTable, FunctionExpression, GroupBy, InExpression, InsertJQL, JoinClause, MathExpression, OrderBy, OrExpressions, PredictJQL, Query, RegexpExpression, ResultColumn, Type } from '.'

test('CREATE DATABASE IF NOT EXISTS School', () => {
  const query = new CreateDatabaseJQL('School', true)
  query.validate()
  console.log(query.toString())
})

test('DROP DATABASE IF EXISTS School', () => {
  const query = new DropDatabaseJQL('School', true)
  query.validate()
  console.log(query.toString())
})

test('CREATE TABLE IF NOT EXISTS Student (...)', () => {
  const query = new CreateTableJQL('Student', [
    new Column<Type>('id', 'number', false, 'PRIMARY KEY'),
    new Column<Type>('name', 'string', false),
    new Column<Type>('gender', 'string', false),
    new Column<Type>('birthday', 'Date', false),
    new Column<Type>('admittedAt', 'Date', false),
    new Column<Type>('graduatedAt', 'Date', true),
  ], true)
  query.validate()
  console.log(query.toString())
})

test('DROP TABLE IF EXISTS Student', () => {
  const query = new DropTableJQL('Student', true)
  query.validate()
  console.log(query.toString())
})

test('INSERT INTO Student VALUES (...)', () => {
  const query = new InsertJQL(['School', 'Student'],
    { id: 1, name: 'Kennys Ng', gender: 'M', birthday: moment('1992-04-21').toDate(), admittedAt: new Date() },
    { id: 2, name: 'Kirino Chiba', gender: 'F', birthday: moment('1992-06-08').toDate(), admittedAt: new Date() },
  )
  query.validate()
  console.log(query.toString())
})

test('INSERT INTO Student (...) SELECT ...', () => {
  const query = new InsertJQL(['School', 'Student'], new Query('School2', 'Student'), ['id', 'name', 'gender', 'birthday', 'admittedAt', 'graduatedAt'])
  query.validate()
  console.log(query.toString())
})

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

test('CREATE TABLE test AS SELECT * FROM URL(GET 127.0.0.1) `Test`', () => {
  const query = new CreateTableJQL({
    name: 'test',
    columns: [
      new Column<Type>('id', 'number', false, 'PRIMARY KEY'),
      new Column<Type>('value', 'string', false),
    ],
    $as: new Query({
      $from: new FromTable({ table: { url: '127.0.0.1', columns: [] }, $as: 'Test' }),
    }),
  })
  query.validate()
  console.log(query.toString())
})

test('SELECT ... UNION SELECT ...', () => {
  const query = new Query({
    $from: 'Table1',
    $union: new Query('Table2'),
  })
  query.validate()
  console.log(query.toString())
})

test('PREDICT (SELECT ...)', () => {
  const query = new PredictJQL(
    new CreateTableJQL({
      $temporary: true,
      name: 'MaleStudents',
      columns: [
        new Column<Type>('id', 'number', false, 'PRIMARY KEY'),
        new Column<Type>('name', 'string', false),
        new Column<Type>('gender', 'string', false),
        new Column<Type>('birthday', 'Date', false),
        new Column<Type>('admittedAt', 'Date', false),
        new Column<Type>('graduatedAt', 'Date', true),
      ],
      $as: new Query([new ResultColumn('*')], 'Student', new BinaryExpression(new ColumnExpression('gender'), '=', 'M')),
    }),
    new Query('MaleStudents'),
  )
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
