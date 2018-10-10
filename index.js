'use strict'
const parse = require('rtf-parser')
const rtfToBbcode = require('./rtf-to-bbcode.js')

module.exports = asStream
module.exports.fromStream = fromStream
module.exports.fromString = fromString

function asStream (opts, cb) {
  if (arguments.length === 1) {
    cb = opts
    opts = null
  }
  return parse(bbcodifyresult(opts, cb))
}

function fromStream (stream, opts) {
  return new Promise((resolve, reject) => {
    return parse.stream(stream, bbcodifyresult(opts, (err, value) => err ? reject(err) : resolve(value)))
  })
}

function fromString (string, opts) {
  return parse.string(string, bbcodifyresult(opts, (err, value) => err ? reject(err) : resolve(value)))
}

function bbcodifyresult (opts, cb) {
  return (err, doc) => {
    if (err) return cb(err)
    try {
      return cb(null, rtfToBbcode(doc, opts))
    } catch (ex) {
      return cb(ex)
    }
  }
}
