const txms = require('../')
const tape = require('tape')
const samples = require('./samples.json')

samples.valid.forEach(function (f) {
  tape.test('OK - Encode - to data. Description: ' + f.description + ' // hex: <' + f.hex.substring(0, 4) + f.hex.slice(-4) + '>', function (t) {
    const actual = txms.encode(f.hex)
    t.plan(1)
    t.same(actual, f.data)
  })
})

samples.valid.forEach(function (f) {
  tape.test('OK - Decode - to hex. Description: ' + f.description + ' // data: <' + f.data.substring(0, 4) + f.data.slice(-4) + '>', function (t) {
    const actual = txms.decode(f.data)
    t.plan(1)
    t.same(actual, f.hex)
  })
})

samples.invalid.forEach(function (f) {
  tape.test('Encode — ' + f.description + ' — throws on: ', function (t) {
    t.plan(1)
    t.throws(function () {
      txms.encode(f.hex)
    }, 'Not a hex format')
  })
})

tape.test('Endpoints - Mainnet - should return object.', function (t) {
  const endpoints = txms.getEndpoint(1, ['us', 'ca'])
  t.true(endpoints instanceof Object)
  t.end()
})

tape.test('Endpoints - Devin - should return object.', function (t) {
  const endpoints = txms.getEndpoint('devin', ['bb', 'sx'])
  t.true(endpoints instanceof Object)
  t.end()
})

tape.test('Endpoints - Default: Mainnet - should return object.', function (t) {
  const endpoints = txms.getEndpoint(undefined, ['us', 'ca'])
  t.true(endpoints instanceof Object)
  t.end()
})
