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
  tape.test('Encode — ' + f.description + ' // hex: <' + f.hex.substring(0, 4) + f.hex.slice(-4) + '>', function (t) {
    t.plan(1)
    t.throws(function () {
      txms.encode(f.hex)
    }, /Not a hex format/)
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

const hexMessage = 'f8dc821ae4850ee6b280008252080196cb65d677385703c528527f2a0f0e401b4af1988d91c5896e3f4f2ab21845000080b8abcffa127f34f8dc8d8bc9a50da5def786a16ecab58d9d1cdc3e1347077f531ad0339797568345464f542f8da3bcd50fd683878f52e6d094610025d6e4a5fb3699acd20ebd1ec2fdde9d12f5e82fe5f4c8d9061466475b3293bb18c34504c6eb43bc0ba48d61a8edfda686c69773fa96b90d00760d8277330d90589ba26fb63874952b013a8af1a5edacbcabb37108b47518c79abd6e50be00da0a08fb9126fd265175cace1ac93d1f809b80'

tape.test('SMS - Single number as string', function (t) {
  const smsUri = txms.sms('+12019715152', hexMessage, 'mainnet')
  t.ok(smsUri.startsWith('sms:+12019715152?body='))
  t.end()
})

tape.test('SMS - Single number as number', function (t) {
  const smsUri = txms.sms(12019715152, hexMessage, 'mainnet')
  t.ok(smsUri.startsWith('sms:+12019715152?body='))
  t.end()
})

tape.test('SMS - Multiple numbers as array', function (t) {
  const smsUri = txms.sms(['+12019715152', '+12014835939'], hexMessage, 'mainnet')
  t.ok(smsUri.startsWith('sms:+12019715152,+12014835939?body='))
  t.end()
})

tape.test('SMS - Default number with boolean true', function (t) {
  const smsUri = txms.sms(true, hexMessage, 'mainnet')
  t.ok(smsUri.startsWith('sms:+12019715152?body='))
  t.end()
})

tape.test('SMS - Invalid number format', function (t) {
  t.plan(1)
  t.throws(function () {
    txms.sms('2019715152', hexMessage, 'mainnet')
  }, /Invalid number format/)
  t.end()
})

tape.test('SMS - No number provided', function (t) {
  const smsUri = txms.sms(false, hexMessage, 'mainnet')
  t.ok(smsUri.startsWith('sms:?body='))
  t.end()
})

tape.test('SMS - Encoding hex message', function (t) {
  const smsUri = txms.sms('+12019715152', hexMessage, 'mainnet', true)
  // The encoded message will vary depending on the implementation of the encode function
  t.ok(smsUri.startsWith('sms:+12019715152?body='))
  t.end()
})

tape.test('SMS - No encoding, only URL encode', function (t) {
  const smsUri = txms.sms('+12019715152', hexMessage, 'mainnet', false)
  // Ensure the message is only URL encoded and not double encoded
  t.ok(smsUri.includes(encodeURIComponent(hexMessage)))
  t.end()
})

tape.test('MMS - Single number as string', function (t) {
  const mmsUri = txms.mms('+12019715152', hexMessage, 'mainnet')
  t.ok(mmsUri.startsWith('mms:+12019715152?body='))
  t.end()
})

tape.test('MMS - Single number as number', function (t) {
  const mmsUri = txms.mms(12019715152, hexMessage, 'mainnet')
  t.ok(mmsUri.startsWith('mms:+12019715152?body='))
  t.end()
})

tape.test('MMS - Multiple numbers as array', function (t) {
  const mmsUri = txms.mms(['+12019715152', '+12014835939'], hexMessage, 'mainnet')
  t.ok(mmsUri.startsWith('mms:+12019715152,+12014835939?body='))
  t.end()
})

tape.test('MMS - Default number with boolean true', function (t) {
  const mmsUri = txms.mms(true, hexMessage, 'mainnet')
  t.ok(mmsUri.startsWith('mms:+12019715152?body='))
  t.end()
})

tape.test('MMS - Invalid number format', function (t) {
  t.plan(1)
  t.throws(function () {
    txms.mms('2019715152', hexMessage, 'mainnet')
  }, /Invalid number format/)
  t.end()
})

tape.test('MMS - No number provided', function (t) {
  const mmsUri = txms.mms(false, hexMessage, 'mainnet')
  t.ok(mmsUri.startsWith('mms:?body='))
  t.end()
})

tape.test('MMS - Encoding hex message', function (t) {
  const mmsUri = txms.mms('+12019715152', hexMessage, 'mainnet', true)
  // The encoded message will vary depending on the implementation of the encode function
  t.ok(mmsUri.startsWith('mms:+12019715152?body='))
  t.end()
})

tape.test('MMS - No encoding, only URL encode', function (t) {
  const mmsUri = txms.mms('+12019715152', hexMessage, 'mainnet', false)
  // Ensure the message is only URL encoded and not double encoded
  t.ok(mmsUri.includes(encodeURIComponent(hexMessage)))
  t.end()
})
