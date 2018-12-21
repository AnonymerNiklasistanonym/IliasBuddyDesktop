/* ===== << Imports >> ====== */

const FetchEntries = require('../FETCH/FetchEntriesApi')
const FileManager = require('../../FileManager/API/FileManager')
const path = require('path')

/* ===== >> Imports << ====== */

const cacheFilePath = path.join('cache.json')

function loadCacheFile () {
  if (FileManager.fileExistsSyncAppData(cacheFilePath)) {
    return JSON.parse(FileManager.readFileSyncAppData(cacheFilePath).toString())
  } else {
    // Return empty array if there is no cache file
    return []
  }
}

const cachedEntries = loadCacheFile()

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
    this.currentEntries = cachedEntries
    this.newEntriesFoundCallback = newEntriesFoundCallback
  }
  static getCachedEntries () {
    return cachedEntries
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
      const theLatestEntry = this.currentEntries[0]

      console.log('The latest fetched entry is from', fetchedEntries[0].date.humanReadable, 'with the link', fetchedEntries[0].link)
      const theLatestFetchedEntry = fetchedEntries[0]

      if (theLatestEntry.link === theLatestFetchedEntry.link) {
        console.log('First fetched entry is the same as the latest link - no new entries')
      } else {
        console.log('First fetched entry is not the same as the latest link - iterate to get new entries')
        for (let index = 0; index < fetchedEntries.length; index++) {
          if (theLatestEntry.link === fetchedEntries[index].link) {
            break
          }
          console.log('a new entry was found', fetchedEntries[index].link)
          newEntries.push(fetchedEntries[index])
        }
      }
    }

    if (newEntries.length > 0) {
      this.currentEntries = newEntries.concat(this.currentEntries)
      this.saveCacheFile()
      return newEntries
    } else {
      return undefined
    }
  }
  static testConnection (url, userName, password) {
    // console.log('ManageEntries - testConnection')
    return FetchEntries.testConnection(url, userName, password)
  }
  getCurrentEntries (callback = false) {
    // console.log('callback', callback)
    return new Promise((resolve, reject) => {
      this.fetchEntries.getCurrentEntries().then(latestEntries => {
        if (latestEntries !== undefined && latestEntries.length !== 0) {
          const analysis = this.checkForUpdates(latestEntries)
          // console.log('analysis', analysis)
          if (analysis !== undefined) {
            // console.log('callback', callback)
            if (callback) {
              // console.log('this.newEntriesFoundCallback(analysis)', analysis)
              this.newEntriesFoundCallback(analysis)
            }
            resolve(analysis)
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
      FileManager.writeFileSyncAppData(cacheFilePath,
        JSON.stringify(this.currentEntries))
    })
  }
}

module.exports = IliasBuddyManageEntriesApi
