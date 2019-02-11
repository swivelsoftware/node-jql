import { Database } from '.'
import { Table } from './metadata/table'
import { Index } from './sandbox/resultset'
import { $binary, $column, $value, Query, TableOrSubquery } from './sql'
import moment = require('moment');

let database: Database

test('Initialize Database', () => {
  database = new Database()
})

test('Create Students', () => {
  database.createTable(
    new Table('Students')
      .addColumn('name', 'string')
      .addColumn('gender', 'string')
      .addColumn('birthday', 'Date')
  )
  database.insert('Students',
    { name: 'Kennys', gender: 'M', birthday: '1992-06-08' },
    { name: 'Susan', gender: 'F', birthday: '1992-01-01' },
    { name: 'Donny', gender: 'M', birthday: '1992-08-04' },
    { name: 'Ken', gender: 'M', birthday: '1992-04-02' },
    { name: 'Lily', gender: 'F', birthday: '1992-09-30' },
    { name: 'Chris', gender: 'M', birthday: '1992-12-20' },
    { name: 'Amy', gender: 'F', birthday: '1992-10-03' },
  )
  
  expect(database.metadata.table('Students').count).toBe(7)
})

test('Query from Students', () => {
  const resultset = database.query<any>(new Query({
    $from: {
      name: 'Students',
    },
    $where: new $binary({
      left: new $column({ name: 'name' }),
      operator: '=',
      right: new $value({ value: 'Kennys' }),
    }),
  }))

  // test: 1 rows
  expect(resultset.count()).toBe(1)

  resultset.next()

  // test: resultset[0].gender = 'M'
  expect(resultset.get(resultset.columnIndexOf('gender') as number)).toBe('M')

  // test: resultset[0].birthday = Date('1992-06-08')
  expect((resultset.get(resultset.columnIndexOf('birthday') as number) as Date).getTime()).toBe(moment('1992-06-08').toDate().getTime())
})

test('Create Marks', () => {
  database.createTable(
    new Table('Marks')
      .addColumn('name', 'string')
      .addColumn('mark', 'number'),
  )
  database.insert('Marks',
    { name: 'Kennys', mark: 95 },
    { name: 'Susan', mark: 90 },
    { name: 'Donny', mark: 100 },
    { name: 'Ken', mark: 99 },
    { name: 'Lily', mark: 85 },
    { name: 'Chris', mark: 75 },
    { name: 'Amy', mark: 88 },
    { name: 'Ann', mark: 70 },
    { name: 'Yoyo', mark: 79 },
    { name: 'Naomi', mark: 81 },
  )

  expect(database.metadata.table('Marks').count).toBe(10)
})

test('Query from Marks with ordering', () => {
  const resultset = database.query<any>(new Query({
    $from: {
      name: 'Marks',
    },
    $order: {
      expression: new $column({
        name: 'mark',
      }),
      order: 'DESC'
    },
    $limit: {
      value: 3
    }
  }))

  // test: 3 rows
  expect(resultset.count()).toBe(3)

  resultset.next()

  // test: resultset[0].name = 'Donny'
  expect(resultset.get(resultset.columnIndexOf('name') as number)).toBe('Donny')
})
