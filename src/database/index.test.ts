import moment = require('moment')
import { Database } from '.'
import { Column } from './schema/column'
import { Table } from './schema/table'
import { BinaryExpression } from './sql/expression/binary'
import { ColumnExpression } from './sql/expression/column'
import { FunctionExpression } from './sql/expression/function'
import { ValueExpression } from './sql/expression/value'
import { Query } from './sql/query'

let database: Database

test('run Database', () => {
  database = new Database()
})

test('create Database', () => {
  database.createDatabase('Dummy')
  database.createDatabase('School')
  expect(database.getContext('Dummy')).not.toBeNull()
  expect(database.getContext('School')).not.toBeNull()
})

test('drop Database', () => {
  database.dropDatabase('Dummy')
  expect(() => database.getContext('Dummy')).toThrow()
})

test('create Tables', () => {
  database.beginTransaction('School')
    .createTable(
      new Table('Dummy')
        .addColumn(new Column('dummy', 'any')),
    )
    .createTable(
      new Table('Student')
        .addColumn(new Column('id', 'string'))
        .addColumn(new Column('firstName', 'string'))
        .addColumn(new Column('lastName', 'string'))
        .addColumn(new Column('birthday', 'Date'))
        .addColumn(new Column('class', 'string')),
    )
    .end()
  expect(database.getSchema('School').tableCount).toBe(2)
})

test('drop Table', () => {
  database.beginTransaction('School')
    .dropTable('Dummy')
    .end()
  expect(database.getSchema('School').tableCount).toBe(1)
})

test('insert Students', () => {
  database.beginTransaction('School')
    .insert('Student',
      { id: '3035019919', firstName: 'Kennys', lastName: 'Ng', birthday: moment.utc('2000-12-24').toDate(), class: '6C' },
      { id: '2048102432', firstName: 'Ken', lastName: 'Chan', birthday: moment.utc('1999-01-01').toDate(), class: '7C' },
      { id: '3035019840', firstName: 'Anakin', lastName: 'Wan', birthday: moment.utc('2000-07-01').toDate(), class: '6C' },
      { id: '3035020960', firstName: 'Joe', lastName: 'Ngai', birthday: moment.utc('2000-12-31').toDate(), class: '6C' },
      { id: '2048409664', firstName: 'World', lastName: 'Hello', birthday: moment.utc('1999-10-01').toDate(), class: '7C' },
    )
    .end()
  expect(database.getSchema('School').getTable('Student').count).toBe(5)
})

test('query Students in class 6C [$where]', () => {
  const query = new Query({
    $from: 'Student',
    $where: new BinaryExpression({
      left: new ColumnExpression('class'),
      operator: '=',
      right: '6C',
    }),
  })
  const transaction = database.beginTransaction('School')
  const resultset = transaction.run(query)
  expect(resultset.length).toBe(3)
  transaction.close()
})

test('query oldest Student [$order & $limit]', () => {
  const query = new Query({
    $from: 'Student',
    $order: { expression: new ColumnExpression('birthday') },
    $limit: 1,
  })
  const transaction = database.beginTransaction('School')
  const resultset = transaction.run(query)
  expect(resultset.length).toBe(1)
  resultset.next()
  expect(resultset.get('firstName')).toBe('Ken')
  transaction.close()
})

test('insert Marks', () => {
  database.beginTransaction('School')
    .createTable(
      new Table('Mark')
        .addColumn(new Column('studentId', 'string'))
        .addColumn(new Column('test', 'string'))
        .addColumn(new Column('mark', 'number')),
    )
    .insert('Mark',
      { studentId: '3035019919', test: 'C# test', mark: 90 },
      { studentId: '3035019919', test: 'Android test', mark: 100 },
      { studentId: '3035019919', test: 'Java test', mark: 95 },
      { studentId: '3035019919', test: 'JS test', mark: 100 },
      { studentId: '2048102432', test: 'C# test', mark: 95 },
      { studentId: '2048102432', test: 'Android test', mark: 98 },
      { studentId: '2048102432', test: 'Java test', mark: 93 },
      { studentId: '2048102432', test: 'JS test', mark: 100 },
      { studentId: '3035019840', test: 'C# test', mark: 95 },
      { studentId: '3035019840', test: 'Android test', mark: 97 },
      { studentId: '3035019840', test: 'Java test', mark: 95 },
      { studentId: '3035019840', test: 'JS test', mark: 98 },
      { studentId: '3035020960', test: 'C# test', mark: 80 },
      { studentId: '3035020960', test: 'Android test', mark: 75 },
      { studentId: '3035020960', test: 'Java test', mark: 78 },
      { studentId: '3035020960', test: 'JS test', mark: 76 },
      { studentId: '2048409664', test: 'C# test', mark: 53 },
      { studentId: '2048409664', test: 'Android test', mark: 55 },
      { studentId: '2048409664', test: 'Java test', mark: 54 },
      { studentId: '2048409664', test: 'JS test', mark: 52 },
    )
    .end()
})

test('query Student\'s marks in Android test [$join]', () => {
  const query = new Query({
    $from: {
      table: 'Student',
      $as: 's',
      joinClauses: {
        tableOrSubquery: {
          table: 'Mark',
          $as: 'm',
        },
        $on: new BinaryExpression({
          left: new ColumnExpression({ table: 's', name: 'id' }),
          operator: '=',
          right: new ColumnExpression({ table: 'm', name: 'studentId' }),
        }),
      },
    },
    $where: new BinaryExpression({
      left: new ColumnExpression({ table: 'm', name: 'test' }),
      operator: '=',
      right: 'Android test',
    }),
    $order: { expression: new ColumnExpression({ table: 'm', name: 'mark' }), order: 'DESC' },
  })
  const transaction = database.beginTransaction('School')
  const resultset = transaction.run(query)
  expect(resultset.length).toBe(5)
  resultset.next()
  expect(resultset.get('firstName')).toBe('Kennys')
  expect(resultset.get('mark')).toBe(100)
  transaction.close()
})

test('query Students\' total score [$group]', () => {
  const query = new Query({
    $select: [
      {
        expression: new FunctionExpression({
          name: 'concat',
          parameters: [
            new ColumnExpression({
              table: 's',
              name: 'firstName',
            }),
            ' ',
            new ColumnExpression({
              table: 's',
              name: 'lastName',
            }),
          ],
        }),
        $as: 'name',
      },
      {
        expression: new FunctionExpression({
          name: 'sum',
          parameters: new ColumnExpression({
            table: 'm',
            name: 'mark',
          }),
        }),
        $as: 'totalScore',
      },
    ],
    $from: {
      table: 'Student',
      $as: 's',
      joinClauses: {
        tableOrSubquery: {
          table: 'Mark',
          $as: 'm',
        },
        $on: new BinaryExpression({
          left: new ColumnExpression({ table: 's', name: 'id' }),
          operator: '=',
          right: new ColumnExpression({ table: 'm', name: 'studentId' }),
        }),
      },
    },
    $group: 'name',
  })

  const transaction = database.beginTransaction('School')
  const resultset = transaction.run(query)

  let foundKennys = false
  while (resultset.next()) {
    if (resultset.get('name') === 'Kennys Ng') {
      expect(resultset.get('totalScore')).toBe(385)
      foundKennys = true
      break
    }
  }
  expect(foundKennys).toBe(true)
})
