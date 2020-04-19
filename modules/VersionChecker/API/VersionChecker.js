/* =====  Imports  ====== */

// npm modules
const { net } = require('electron')
const compareVersions = require('compare-versions')

/* =====  Module  ====== */

/**
 * Version checker helper
 */
class VersionChecker {
  /**
   * Get the latest GitHub tag
   * @param {string} githubLatestReleaseUrl
   * @returns {Promise<import('./VersionCheckerTypes').GitHubLatestTag>}
   */
  static getLatestTagGithub (githubLatestReleaseUrl) {
    return new Promise((resolve, reject) => {
      // Create a buffer in which all the chunks of data will be saved
      let responseDataBuffer = []
      // Create a future return object
      let jsonObject
      // Make a request to the github api about the latest release
      net
        .request(githubLatestReleaseUrl)
        .on('response', response => {
          if (response.statusCode === 200) {
            response
              // Save gotten response data into the buffer
              .on('data', chunk => { responseDataBuffer.push(chunk) })
              // When there is no more response data read buffer
              .on('end', () => {
                const jsonObjectString = Buffer
                  .concat(responseDataBuffer)
                  .toString()
                // Prepare buffer to be garbage collected
                responseDataBuffer = null
                // try to parse the response data into an json object
                try {
                  jsonObject = JSON.parse(jsonObjectString)
                } catch (err) {
                  reject(err)
                }
              })
              // When an error occurs
              .on('error', reject)
          } else {
            reject(Error('Status code error: ' + response.statusCode))
          }
        })
        // When an error occurs
        .on('error', reject)
        // When 'the last' event in the HTTP request-response transaction
        //  was done
        .on('close', () => { resolve(jsonObject) }).end()
    })
  }

  /**
   * Check if a tag is newer than the old tag
   * @param {string} oldTag The old version tag
   * @param {string} newTag The new version tag
   * @example checkIfTagIsNewer('1', '2') // true
   * @example checkIfTagIsNewer('2', '1') // false
   * @example checkIfTagIsNewer('2', '2') // false
   * @example checkIfTagIsNewer('v2', '2') // false
   * @example checkIfTagIsNewer('v2.0.0', '2.0.0') // false
   * @example checkIfTagIsNewer('v0.0.1', '2.0.0') // true
   * @example checkIfTagIsNewer('v0.0.1', 'v2.0.0') // true
   * @example checkIfTagIsNewer('0.1', '0.0.1') // false
   * @example checkIfTagIsNewer('0.0.1', '0.1') // true
   * @returns {boolean} Tag is newer
   */
  static checkIfTagIsNewer (oldTag, newTag) {
    return compareVersions(newTag, oldTag) === 1
  }
}

/* =====  Exports  ====== */

module.exports = VersionChecker
