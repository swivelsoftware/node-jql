import { Column, CreateSchema, CreateTable, DropSchema, DropTable, PrimaryKeyConstraint } from '@node-jql/sql-builder'
import { CoreApplication } from '.'

let app: CoreApplication
let sessionId: string

test('Initialize', async done => {
  app = new CoreApplication({ logLevel: 'debug' })
  sessionId = await app.createSession()
  done()
})

test('Create schema', done => {
  app.update(new CreateSchema('TEMP_DB'), { sessionId })
    .on('complete', ({ rowsAffected }) => {
      expect(rowsAffected).toBe(1)
      done()
    })
    .on('error', err => { throw err })
})

test('Create table', done => {
  app.update(
    new CreateTable.Builder('TEMP_TABLE')
      .ifNotExists()
      .column(
        new Column.Builder('id', 'BIGINT')
          .options('AUTO_INCREMENT')
          .toJson(),
      )
      .column(
        new Column.Builder('col1', 'VARCHAR', 128)
          .toJson(),
      )
      .column(
        new Column.Builder('col1', 'INT')
          .toJson(),
      )
      .constraint(new PrimaryKeyConstraint('id'))
      .build(),
    {
      schema: 'TEMP_DB',
      sessionId,
    },
  )
    .on('complete', ({ rowsAffected }) => {
      expect(rowsAffected).toBe(1)
      done()
    })
    .on('error', err => { throw err })
})

test('Drop table', done => {
  app.update(
    new DropTable.Builder('TEMP_TABLE')
      .ifExists()
      .build(),
    {
      schema: 'TEMP_DB',
      sessionId,
    },
  )
    .on('complete', ({ rowsAffected }) => {
      expect(rowsAffected).toBe(1)
      done()
    })
    .on('error', err => { throw err })
})

test('Drop schema', done => {
  app.update(new DropSchema('TEMP_DB'), { sessionId })
    .on('complete', ({ rowsAffected }) => {
      expect(rowsAffected).toBe(1)
      done()
    })
    .on('error', err => { throw err })
})

test('Close', async done => {
  await app.killSession(sessionId)
  done()
})
