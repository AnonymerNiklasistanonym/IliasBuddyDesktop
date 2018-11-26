/* ===== << Imports >> ====== */

const { net } = require('electron')
const convert = require('xml-js')
const fs = require('fs')
const RawEntryParser = require('../Parser/RawEntryParser')
const Renderer = require('../GUI/Renderer')

/* ===== >> Imports << ====== */

class IliasBuddyApi {
  /**
   * Creates an instance of IliasBuddyApi.
   * @param {string} url
   * @param {string} userName
   * @param {string} password
   */
  constructor (url, userName, password) {
    this.url = url
    this.userName = userName
    this.password = password
  }
  /**
   * @returns {Promise<import('./IliasPrivateRssFeedTypes').IliasPrivateRssFeed.WholeThing>}
   */
  getCurrentEntriesRaw () {
    return new Promise((resolve, reject) => {
      net.request(this.url)
        .on('response', response => {
          const responseDataBuffer = []
          response
            .on('data', chunk => {
              responseDataBuffer.push(chunk)
            })
            .on('error', reject)
            .on('end', () => {
              const rssString = Buffer.concat(responseDataBuffer).toString()
              fs.writeFile('lastRss.xml', rssString, err => {
                if (err) reject(err)
              })
              // Parse raw feed
              const result = JSON.parse(convert.xml2json(rssString, {
                compact: true
              }))
              fs.writeFile('lastParsedRss.json', JSON.stringify(result, null, 4), err => {
                if (err) reject(err)
              })
              // Return parsed feed raw
              resolve(result)
            })
        })
        .on('login', (authInfo, callback) => {
          callback(this.userName, this.password)
        })
        .on('error', reject)
        .end()
    })
  }
  /**
   * Get the current Ilias entries
   * @returns {Promise<import('./IliasBuddyApiTypes').IliasBuddyApi.Entry[]>}
   */
  getCurrentEntries () {
    return new Promise((resolve, reject) => {
      this.getCurrentEntriesRaw()
        .then(entries => entries.rss.channel.item.map(RawEntryParser.parseRawEntry))
        .then(entries => entries.map(RawEntryParser.parseToIliasEntry.bind(RawEntryParser)))
        .then(result => {
          fs.writeFile('lastParsedJsonRss.json', JSON.stringify(result, null, 4), err => {
            if (err) reject(err)
          })

          return result
        })
        .then(resolve)
        .catch(reject)
    })
  }
  /**
   * Get the current Ilias entries as HTML elements
   * @param {import('./IliasBuddyApiTypes').IliasBuddyApi.Entry[]} entries
   * @returns {HTMLLIElement[]}
   */
  static renderEntriesHtml (entries) {
    return entries.map(Renderer.render.bind(Renderer))
  }
}

module.exports = IliasBuddyApi
