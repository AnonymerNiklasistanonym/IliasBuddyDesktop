const { net } = require('electron')

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
  // TODO
  /**
   * Check if a tag is newer than the old tag
   * @todo Write the documentation.
   * @param {string} oldTag
   * @param {string} newTag
   * @returns {boolean} Tag is newer
   */
  static checkIfTagIsNewer (oldTag, newTag) {
    return false
  }
  // TODO
  /**
   * Check if there are any updates
   * @todo Write the documentation.
   * @param {string} oldTag
   * @returns {Promise<import('./VersionCheckerTypes').LatestVersionCheck>}
   */
  static checkForLatestVersion (oldTag) {
    return new Promise((resolve, reject) => {
      resolve({ newerVersionAvailable: false })
    })
  }
}

module.exports = VersionChecker
