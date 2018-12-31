/* =====  Imports  ====== */

// npm modules
const { net, session } = require('electron')
const convert = require('xml-js')
const log = require('electron-log')
// custom modules
const RawEntryParser = require('../PARSER/RawEntryParserApi')

/* =====  Modules  ====== */

/**
 * Module to easily fetch Ilias entries / test connection to RSS feed / ...
 */
class IliasBuddyFetchEntriesApi {
  /**
   * Creates an instance of IliasBuddyFetchEntriesApi
   * @param {string} url Private Ilias RSS feed url
   * @param {string} userName Private Ilias RSS feed username
   * @param {string} password Private Ilias RSS feed password
   */
  constructor (url, userName, password) {
    this.url = url
    this.userName = userName
    this.password = password
  }
  /**
   * Test if a successful connection can be established
   * @param {string} url Private Ilias RSS feed url
   * @param {string} userName Private Ilias RSS feed username
   * @param {string} password Private Ilias RSS feed password
   * @param {Promise<void>}
   */
  static testConnection (url, userName, password) {
    log.debug('testConnection')
    // console.log('FetchEntries - testConnection')
    return new Promise((resolve, reject) =>
      // Do first clear the authentication cache
      // FIXME It should fail after changing userName/userPassword!
      // TODO Remove the saved authentication before checking the connection!
      session.defaultSession.clearAuthCache({ password }, () =>
        session.defaultSession.clearStorageData(
          {},
          () => {
            // Make a request to get the page data of the URL
            log.debug('testConnection > Make net request')
            net.request(url)
              .on('response', response => {
                // On a server response check first that status code
                log.debug('testConnection > Make net request > Response')
                if (response.statusCode === 200) {
                  log.debug('testConnection > Make net request > Response > OK')
                  response
                    .on('data', chunk => { /* needs to be called */ })
                    .on('error', reject)
                    .on('end', () => {
                      // When connection was able to get data and ended resolve
                      log.debug('testConnection > Make net request > end')
                      resolve()
                    })
                } else {
                  // If the status code is not OK reject
                  reject(Error(`Wrong status code (${response.statusCode})`))
                }
              })
              .on('login', (authInfo, callback) => {
                callback(userName, password)
              })
              .on('error', reject)
              .end()
          })
      )
    )
  }
  /**
   * Get the current entries "Raw" which means parsed as JSON but not modified
   * in any way
   * @returns {Promise<import('./FetchEntriesTypes')
   * .IliasPrivateRssFeed.WholeThing>}
   */
  getCurrentEntriesRaw () {
    return new Promise((resolve, reject) => net.request(this.url)
      .on('response', response => {
        const responseDataBuffer = []
        response
          .on('data', chunk => { responseDataBuffer.push(chunk) })
          .on('error', reject)
          .on('end', () => {
            const rssString = Buffer.concat(responseDataBuffer).toString()
            // Parse raw feed
            try {
              const result = JSON.parse(convert.xml2json(rssString,
                { compact: true }))
              // Return parsed feed raw
              resolve(result)
            } catch (e) {
              reject(e)
            }
          })
      })
      .on('login', (authInfo, callback) => {
        callback(this.userName, this.password)
      })
      .on('error', reject)
      .end()
    )
  }
  /**
   * Get the current Ilias entries
   * @returns {Promise<import('../PARSER/RawEntryParserTypes')
   * .IliasBuddyRawEntryParser.Entry[]>}
   */
  getCurrentEntries () {
    return new Promise((resolve, reject) => {
      this.getCurrentEntriesRaw()
        .then(entries => {
          // Double check if currently any entries are even available
          if (entries.rss.channel.item !== undefined) {
            return entries.rss.channel.item.map(RawEntryParser.parseRawEntry)
          } else {
            // Log it but don't display an error, because these things can
            // happen
            log.debug('No current entries were found!')
            return []
          }
        })
        .then(entries => entries
          .map(RawEntryParser.parseToIliasBuddyEntry.bind(RawEntryParser)))
        .then(resolve)
        .catch(err => {
          console.error('Get current Entries error:', err)
          reject(err)
        })
    })
  }
}

/* =====  Exports  ====== */

module.exports = IliasBuddyFetchEntriesApi
