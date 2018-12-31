const assert = require('assert')
const Module = require('../../modules/VersionChecker/API/VersionChecker')

/**
 * Test of the method `VersionChecker.checkIfTagIsNewer`
 */
const checkIfTagNewer = () => {
  const assertAllCombinations = (oldTag, newTag, expected) => {
    assert.strictEqual(Module.checkIfTagIsNewer(oldTag, newTag), expected,
      `Compare oldTag=${oldTag} with newTag=${newTag}}`)
    assert.strictEqual(Module.checkIfTagIsNewer('v' + oldTag, 'v' + newTag),
      expected, `Compare oldTag=${'v' + oldTag} with newTag=${'v' + newTag}}`)
    assert.strictEqual(Module.checkIfTagIsNewer(oldTag, 'v' + newTag), expected,
      `Compare oldTag=${oldTag} with newTag=${'v' + newTag}}`)
    assert.strictEqual(Module.checkIfTagIsNewer('v' + oldTag, newTag), expected,
      `Compare oldTag=${'v' + oldTag} with newTag=${newTag}}`)
  }
  assertAllCombinations('1', '2', true)
  assertAllCombinations('2', '1', false)
  assertAllCombinations('2', '2', false)
  assertAllCombinations('2.0.0', '2.0.0', false)
  assertAllCombinations('0.0.1', '2.0.0', true)
  assertAllCombinations('0.1', '0.0.1', false)
  assertAllCombinations('0.0.1', '0.1', true)
}

module.exports = () => {
  checkIfTagNewer()
}
