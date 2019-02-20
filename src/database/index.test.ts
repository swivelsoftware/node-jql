import moment = require('moment')
import { Database } from '.'
import { Column } from './schema/column'
import { Table } from './schema/table'
import { Query } from './sql/query'
import { ColumnExpression } from './sql/expression/column';
import { BinaryExpression } from './sql/expression/binary';
import { ValueExpression } from './sql/expression/value';

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
        .addColumn(new Column('age', 'number'))
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
      { id: '3035019919', firstName: 'Kennys', lastName: 'Ng', birthday: moment('2000-06-08').toDate(), age: 18, class: '6C' },
      { id: '2048102432', firstName: 'Ken', lastName: 'Chan', birthday: moment('1999-01-01').toDate(), age: 20, class: '7C' },
      { id: '3035019840', firstName: 'Anakin', lastName: 'Wan', birthday: moment('2000-02-04').toDate(), age: 19, class: '6C' },
      { id: '3035020960', firstName: 'Joe', lastName: 'Ngai', birthday: moment('2000-12-31').toDate(), age: 18, class: '6C' },
    )
    .end()
  expect(database.getSchema('School').getTable('Student').count).toBe(4)
})

test('query Students', () => {
  const query = new Query({ $from: 'Student' })
  const transaction = database.beginTransaction('School')
  const resultset = transaction.run(query)
  expect(resultset.length).toBe(4)
  transaction.close()
})

test('query oldest Student', () => {
  const query = new Query({
    $from: 'Student',
    $order: { expression: new ColumnExpression('age'), order: 'DESC' },
    $limit: 1
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
        .addColumn(new Column('mark', 'number'))
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
    )
    .end()
})

test('query Student with highest mark in Android test', () => {
  const query = new Query({
    $from: {
      table: 'Student',
      $as: 's',
      joinClauses: {
        tableOrSubquery: {
          table: 'Mark',
          $as: 'm'
        },
        $on: new BinaryExpression({
          left: new ColumnExpression({ table: 's', name: 'id' }),
          operator: '=',
          right: new ColumnExpression({ table: 'm', name: 'studentId' })
        })
      }
    },
    $where: new BinaryExpression({
      left: new ColumnExpression({ table: 'm', name: 'test' }),
      operator: '=',
      right: 'Android test'
    }),
    $order: { expression: new ColumnExpression({ table: 'm', name: 'mark' }), order: 'DESC' },
    $limit: 1
  })
  const transaction = database.beginTransaction('School')
  const resultset = transaction.run(query)
})
