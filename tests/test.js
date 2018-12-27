const assert = require('assert')
const fs = require('fs')
const path = require('path')

// Error: assert(5 > 7, 'Message 5 > 7')
assert(7 > 5, 'Message 7 > 5')

console.info(fs.readFileSync(path.join(__dirname, 'tests_passed_original.txt'))
  .toString())
