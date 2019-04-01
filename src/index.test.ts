/* tslint:disable:no-console */

import { BinaryExpression } from './expression/binary'
import { ColumnExpression } from './expression/column'
import { FunctionExpression } from './expression/function'
import { InExpression } from './expression/in'
import { Value } from './expression/value'
import { Query } from './query'
import { JoinClause } from './query/joinClause'
import { OrderingTerm } from './query/orderingTerm'
import { ResultColumn } from './query/resultColumn'
import { JoinedTableOrSubquery } from './query/tableOrSubquery'

test('SELECT `*` FROM Students', () => {
  const query = new Query({ $from: 'Students' })
  query.validate()
  expect(query.toString()).toBe('SELECT `*` FROM Students')
})

test('SELECT `*` FROM Students WHERE (`class` = \'7C\') ORDER BY `id` ASC', () => {
  const query = new Query({
    $from: 'Students',
    $where: new BinaryExpression({
      left: new ColumnExpression('class'),
      operator: '=',
      right: '7C',
    }),
    $order: new OrderingTerm({ expression: new ColumnExpression('id') }),
  })
  query.validate()
  expect(query.toString()).toBe('SELECT `*` FROM Students WHERE (`class` = \'7C\') ORDER BY `id` ASC')
})

test('SELECT `mark` FROM Students `s` LEFT JOIN Marks `m` ON (`m`.`studentId` = `s`.`id`) WHERE (`name` = \'Kennys Ng\') LIMIT 1', () => {
  const query = new Query({
    $select: 'mark',
    $from: new JoinedTableOrSubquery({
      table: 'Students',
      $as: 's',
      joinClauses: new JoinClause({
        operator: 'LEFT',
        tableOrSubquery: ['Marks', 'm'],
        $on: new BinaryExpression({
          left: new ColumnExpression(['m', 'studentId']),
          operator: '=',
          right: new ColumnExpression(['s', 'id']),
        }),
      }),
    }),
    $where: new BinaryExpression({
      left: new ColumnExpression('name'),
      operator: '=',
      right: 'Kennys Ng',
    }),
    $limit: { value: 1 },
  })
  query.validate()
  expect(query.toString()).toBe('SELECT `mark` FROM Students `s` LEFT JOIN Marks `m` ON (`m`.`studentId` = `s`.`id`) WHERE (`name` = \'Kennys Ng\') LIMIT 1')
})

test('SELECT COUNT(`*`) FROM Students WHERE (`id` IN (SELECT `studentId` FROM ClubsStudents `cs` LEFT JOIN Clubs `c` ON (`cs`.`clubId` = `c`.`id`) WHERE (`c`.`name` = \'Science Club\')))', () => {
  const query = new Query({
    $select: new ResultColumn({
      expression: new FunctionExpression({
        name: 'COUNT',
        parameters: new ColumnExpression('*'),
      }),
    }),
    $from: 'Students',
    $where: new InExpression({
      left: new ColumnExpression('id'),
      right: new Query({
        $select: 'studentId',
        $from: new JoinedTableOrSubquery({
          table: 'ClubsStudents',
          $as: 'cs',
          joinClauses: new JoinClause({
            operator: 'LEFT',
            tableOrSubquery: ['Clubs', 'c'],
            $on: new BinaryExpression({
              left: new ColumnExpression(['cs', 'clubId']),
              operator: '=',
              right: new ColumnExpression(['c', 'id']),
            }),
          }),
        }),
        $where: new BinaryExpression({
          left: new ColumnExpression(['c', 'name']),
          operator: '=',
          right: 'Science Club',
        }),
      }),
    }),
  })
  query.validate()
  expect(query.toString()).toBe('SELECT COUNT(`*`) FROM Students WHERE (`id` IN (SELECT `studentId` FROM ClubsStudents `cs` LEFT JOIN Clubs `c` ON (`cs`.`clubId` = `c`.`id`) WHERE (`c`.`name` = \'Science Club\')))')
})

test('SELECT 1', () => {
  const query = new Query({
    $select: new ResultColumn({
      expression: new Value(1),
    }),
  })
  query.validate()
  expect(query.toString()).toBe('SELECT 1')
})
