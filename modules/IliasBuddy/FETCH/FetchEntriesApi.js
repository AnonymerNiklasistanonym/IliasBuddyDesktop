/* ===== << Imports >> ====== */

const { net } = require('electron')
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
   * @returns {Promise<import('./FetchEntriesTypes').IliasPrivateRssFeed.WholeThing>}
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
            /* DEBUG
            fs.writeFile('lastRss.xml', rssString, err => {
              if (err) reject(err)
            })
            */
            // Parse raw feed
            const result = JSON.parse(convert.xml2json(rssString, { compact: true }))
            /* DEBUG
            fs.writeFile('lastParsedRss.json', JSON.stringify(result, null, 4), err => {
              if (err) reject(err)
            })
            */
            // Return parsed feed raw
            resolve(result)
          })
      })
      .on('login', (authInfo, callback) => { callback(this.userName, this.password) })
      .on('error', reject)
      .end()
    )
  }
  static testConnection (url, userName, password) {
    // console.log('FetchEntries - testConnection')
    return new Promise((resolve, reject) => net.request(url)
      .on('response', response => {
        // console.log('FetchEntries - testConnection .on(\'response\'')
        response
          .on('data', chunk => {})
          .on('error', err => {
            // console.log('FetchEntries - testConnection - reject')
            reject(err)
          })
          .on('end', () => {
            // console.log('FetchEntries - testConnection - resolve')
            resolve()
          })
      })
      .on('login', (authInfo, callback) => { callback(userName, password) })
      .on('error', reject)
      .end()
    )
  }
  /**
   * Get the current Ilias entries
   * @returns {Promise<import('../PARSER/RawEntryParserTypes').IliasBuddyRawEntryParser.Entry[]>}
   */
  getCurrentEntries () {
    return new Promise((resolve, reject) => {
      this.getCurrentEntriesRaw()
        .then(entries => entries.rss.channel.item.map(RawEntryParser.parseRawEntry))
        .then(entries => entries.map(RawEntryParser.parseToIliasBuddyEntry.bind(RawEntryParser)))
        .then(result => {
          /* DEBUG
          fs.writeFile('lastParsedJsonRss.json', JSON.stringify(result, null, 4), err => {
            if (err) reject(err)
          })
          */

          return result
        })
        .then(resolve)
        .catch(err => {
          console.error('Get current Entries error:', err)
          reject(err)
        })
    })
  }
}

module.exports = IliasBuddyFetchEntriesApi
