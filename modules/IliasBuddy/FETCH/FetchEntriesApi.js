/* ===== << Imports >> ====== */

const { net, session } = require('electron')
const convert = require('xml-js')
// const fs = require('fs')
const RawEntryParser = require('../PARSER/RawEntryParserApi')

/* ===== >> Imports << ====== */

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
            const result = JSON.parse(convert.xml2json(rssString,
              { compact: true }))
            // Return parsed feed raw
            resolve(result)
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
   * Test if a successful connection can be established
   * @param {string} url Private Ilias RSS feed url
   * @param {string} userName Private Ilias RSS feed username
   * @param {string} password Private Ilias RSS feed password
   * @param {Promise<void>}
   */
  static testConnection (url, userName, password) {
    // console.log('FetchEntries - testConnection')
    return new Promise((resolve, reject) => {
      // Do first clear the authentication cache
      session.defaultSession.clearAuthCache({ password }, () => {
        // Try this for now
        // TODO
        session.defaultSession.clearStorageData(undefined, () => {
          net.request(url)
            .on('response', response => {
              // console.log('FetchEntries - testConnection .on(\'response\'')
              if (response.statusCode === 200) {
                response
                  .on('data', chunk => { return undefined })
                  .on('error', err => {
                    // console.log('FetchEntries - testConnection - reject')
                    reject(err)
                  })
                  .on('end', () => {
                    // console.log('FetchEntries - testConnection - resolve')
                    resolve()
                  })
              } else {
                reject(Error(`Wrong status code (${response.statusCode})`))
              }
            })
            .on('login', (authInfo, callback) => {
              callback(userName, password)
            })
            .on('error', reject)
            .end()
        })
      })
    })
  }
  /**
   * Get the current Ilias entries
   * @returns {Promise<import('../PARSER/RawEntryParserTypes')
   * .IliasBuddyRawEntryParser.Entry[]>}
   */
  getCurrentEntries () {
    return new Promise((resolve, reject) => {
      this.getCurrentEntriesRaw()
        .then(entries => entries.rss.channel.item
          .map(RawEntryParser.parseRawEntry))
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

module.exports = IliasBuddyFetchEntriesApi
