/* ===== << Imports >> ====== */

const FetchEntries = require('../FETCH/FetchEntriesApi')
const fs = require('fs')
const path = require('path')

/* ===== >> Imports << ====== */

class IliasBuddyManageEntriesApi {
  /**
   * Creates an instance of IliasBuddyFetchEntriesApi
   * @param {string} url Private Ilias RSS feed url
   * @param {string} userName Private Ilias RSS feed username
   * @param {string} password Private Ilias RSS feed password
   * @param {function(*[]): void} newEntriesFoundCallback
   */
  constructor (url, userName, password, newEntriesFoundCallback) {
    this.fetchEntries = new FetchEntries(url, userName, password)
    this.fetchIntervalSeconds = 15
    this.fetchFilePath = path.join(__dirname, '..', '..', 'cache.json')
    this.currentEntries = this.loadCacheFile()
    this.newEntriesFoundCallback = newEntriesFoundCallback
  }
  startBackgroundChecks () {
    this.interval = setInterval(() => {
      console.log('Check for new entries... ')
      this.getCurrentEntries(true).then(() => {
        console.log('... finished')
      }).catch(console.error)
    }, 1000 * this.fetchIntervalSeconds)
  }
  checkForUpdates (fetchedEntries) {
    console.log('checkForUpdates', fetchedEntries.length)
    if (fetchedEntries === undefined) throw Error('Latest entries cannot be undefined')
    if (fetchedEntries.length === 0) throw Error('Latest entries cannot be empty')

    let newEntries = []

    if (this.currentEntries.length === 0) {
      console.log('There are no current entries - take all fetched entries')
      newEntries = fetchedEntries
    } else {
      console.log('There are current entries', 'The latest one is from', this.currentEntries[0].date.humanReadable, 'with the link', this.currentEntries[0].link)
      const theLatestLink = this.currentEntries[0].link

      if (theLatestLink === fetchedEntries[0].link) {
        console.log('First fetched entry is the same as the latest link - no new entries')
        return undefined
      }

      console.log('First fetched entry is not the same as the latest link - iterate to get new entries')
      for (let index = 0; index < fetchedEntries.length; index++) {
        if (theLatestLink !== fetchedEntries[index].link) {
          console.log('a new entry was found', fetchedEntries[index].link)
          newEntries.push(fetchedEntries[index])
        }
      }
    }

    if (newEntries.length !== 0) {
      this.currentEntries = newEntries.concat(this.currentEntries)
      this.saveCacheFile()
      return newEntries
    } else {
      return undefined
    }
  }
  getCurrentEntries (callback = false) {
    return new Promise((resolve, reject) => {
      this.fetchEntries.getCurrentEntries().then(latestEntries => {
        if (latestEntries !== undefined && latestEntries.length !== 0) {
          const analysis = this.checkForUpdates(latestEntries)
          if (analysis !== undefined) {
            if (callback) {
              this.newEntriesFoundCallback(analysis)
              resolve()
            } else {
              resolve(analysis)
            }
          } else {
            resolve([])
          }
        } else {
          resolve([])
        }
      }).catch(console.error)
    })
  }
  stopBackgroundChecks () {
    if (this.interval !== undefined) {
      clearInterval(this.interval)
    }
  }
  saveCacheFile () {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.fetchFilePath,
        JSON.stringify(this.currentEntries, null, 4),
        err => {
          if (err) reject(err)
          else resolve()
        })
    })
  }
  loadCacheFile () {
    if (fs.existsSync(this.fetchFilePath)) {
      return JSON.parse(fs.readFileSync(this.fetchFilePath).toString())
    } else {
      // Return empty array if there is no cache file
      return []
    }
  }
}

module.exports = IliasBuddyManageEntriesApi
