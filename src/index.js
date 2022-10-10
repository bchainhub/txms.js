'use strict'
const txms = {
  encode: function (hex) {
    let data = ''
    if (hex.substring(0, 2).toLowerCase() === '0x') {
      hex = hex.substring(2)
    }
    const hextest = /^[0-9a-fA-F]+$/
    if (!hextest.test(hex)) {
      const errorHex = Error('Not a hex format')
      // errorHex.code = 415
      throw errorHex
    }
    while (hex.length % 4 !== 0) {
      hex = '0' + hex
    }
    for (let j = 0; j < hex.length; j += 4) {
      const hexchar = hex.substring(j, j + 4)
      const character = String.fromCharCode(parseInt(hexchar, 16))
      data += character.replace(/\p{C}|\p{Z}|\ufffd|\u007e/u, '~' + String.fromCharCode(parseInt(('01' + hexchar.slice(0, 2)), 16)) + String.fromCharCode(parseInt(('01' + hexchar.slice(2, 4)), 16)))
    }
    return data
  },
  decode: function (data) {
    let hex = ''
    let l
    for (l = 0; l < data.length; l++) {
      if (data[l] === '~') {
        hex += ('000' + data.charCodeAt(l + 1).toString(16)).slice(-2) + ('000' + data.charCodeAt(l + 2).toString(16)).slice(-2)
        l = l + 2
      } else {
        hex += ((l === 0 ? '' : '000') + data.charCodeAt(l).toString(16)).slice(-4)
      }
    }
    return ('0x' + hex)
  },
  getEndpoint: function (network, countriesList) {
    let requestedList
    if (countriesList instanceof Array) {
      requestedList = countriesList
    } else {
      requestedList = new Array(countriesList)
    }
    const countries = {
      // Mainnet network
      1: {
        ag: [''],
        ai: [''],
        as: [''],
        bb: [''],
        bm: [''],
        bs: [''],
        ca: [''],
        dm: [''],
        do: [''],
        gd: [''],
        gu: [''],
        jm: [''],
        kn: [''],
        ky: [''],
        lc: [''],
        mp: [''],
        ms: [''],
        pr: [''],
        sx: [''],
        tc: [''],
        tt: [''],
        us: [''],
        vc: [''],
        vg: [''],
        vi: [''],
        um: ['']
      },
      // Devin network
      3: {
        ag: [''],
        ai: [''],
        as: [''],
        bb: [''],
        bm: [''],
        bs: [''],
        ca: [''],
        dm: [''],
        do: [''],
        gd: [''],
        gu: [''],
        jm: [''],
        kn: [''],
        ky: [''],
        lc: [''],
        mp: [''],
        ms: [''],
        pr: [''],
        sx: [''],
        tc: [''],
        tt: [''],
        us: [''],
        vc: [''],
        vg: [''],
        vi: [''],
        um: ['']
      }
    }
    const aliases = {
      mainnet: 1,
      devin: 3
    }
    let netw
    if (!network) {
      netw = 1
    } else if (typeof network === 'string') {
      netw = aliases[network.toLowerCase()]
    } else {
      netw = network
    }
    if (!requestedList) {
      return countries[netw]
    } else {
      const endpoints = {}
      for (let n = 0; n < requestedList.length; n++) {
        endpoints[requestedList[n]] = countries[netw][requestedList[n]]
      }
      return endpoints
    }
  }
}
module.exports = txms
