import { createReadonly } from './createReadonly'

test('Create Readonly Object', () => {
  let object = { hello: 'world' }
  object = createReadonly(object)
  expect(() => object.hello = 'kennys').toThrow()
})

test('Create Complex Readonly Object', () => {
  let object = { hello: { name: 'world' } }
  object = createReadonly(object)
  expect(() => object.hello.name = 'kennys').toThrow()
})
