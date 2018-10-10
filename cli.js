#!/usr/bin/env node
'use strict'
require('@iarna/cli')(main)
  .usage('$0 <file>')
  .demand(1)

const fs = require('fs')
const rtfToBbcode = require('.')

async function main (opts, file) {
  console.log(await rtfToBbcode.fromStream(fs.createReadStream(file)))
}
