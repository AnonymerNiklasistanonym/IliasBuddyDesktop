/* =====  Imports  ====== */

// npm modules
const path = require('path')
const log = require('electron-log')
// custom modules
const FetchEntries = require('../FETCH/FetchEntriesApi')
const FileManager = require('../../FileManager/API/FileManager')

/* =====  Content  ====== */

/**
 * The cache file path
 */
const gCacheFilePath = path.join('cache_ilias_entries.json')
// TODO Implement function that can delete the cache file

/**
 * Load cache file content
 * @returns {import('../FETCH/FetchEntriesTypes')
 * .IliasBuddyFetchEntries.Entry[]}
 */
function loadCacheFile () {
  if (FileManager.fileExistsSyncAppData(gCacheFilePath)) {
    return JSON.parse(FileManager.readFileSyncAppData(gCacheFilePath)
      .toString())
  } else {
    // Return empty array if there is no cache file
    return []
  }
}

// Load cached entries into variable
let cachedEntries = loadCacheFile()

/**
 * Class that helps managing all the Ilias entries by combining fetching,
 * new entries evaluating and cache management
 */
class IliasBuddyManageEntriesApi {
  /**
   * Creates an instance of IliasBuddyFetchEntriesApi
   * @param {string} url Private Ilias RSS feed url
   * @param {string} userName Private Ilias RSS feed username
   * @param {string} password Private Ilias RSS feed password
   * @param {import('../API/IliasBuddyTypes').IliasBuddyApi
   * .NewEntriesFoundCallback} newEntriesFoundCallback
   */
  constructor (url, userName, password, newEntriesFoundCallback) {
    this.fetchEntries = new FetchEntries(url, userName, password)
    this.fetchIntervalSeconds = 15
    /**
     * The current Ilias entries
     * @type {import('../FETCH/FetchEntriesTypes')
     * .IliasBuddyFetchEntries.Entry[]}
     */
    this.currentEntries = cachedEntries
    this.newEntriesFoundCallback = newEntriesFoundCallback
  }
  /**
   * Get the already cached entries
   */
  static getCachedEntries () {
    return cachedEntries
  }
  /**
   * Test if a connection with a `200` response can be established
   * @param {string} url Private Ilias feed URL
   * @param {string} userName Private Ilias feed user name for authentication
   * @param {string} password Private Ilias feed password for authentication
   * @returns {Promise<void>}
   */
  static testConnection (url, userName, password) {
    log.debug('ManageEntries > test connection')
    return FetchEntries.testConnection(url, userName, password)
  }
  /**
   * Check if in a list of fetched entries new entries can be found
   * @param {import('../FETCH/FetchEntriesTypes')
   * .IliasBuddyFetchEntries.Entry[]} fetchedEntries
   * @returns {import('../FETCH/FetchEntriesTypes')
   * .IliasBuddyFetchEntries.Entry[]}
   */
  extractNewEntries (fetchedEntries) {
    if (fetchedEntries === undefined) {
      throw Error('Latest entries cannot be undefined')
    }
    if (fetchedEntries.length === 0) {
      throw Error('Latest entries cannot be empty')
    }

    /**
     * List for all the new entries
     * @type {import('../FETCH/FetchEntriesTypes')
     * .IliasBuddyFetchEntries.Entry[]}
     */
    let newEntries = []

    if (this.currentEntries.length === 0) {
      log.info('checkForUpdates',
        'There are no current entries - take all fetched entries')
      // Set new entries to all fetched entries when there are no
      // current entries
      newEntries = fetchedEntries
    } else {
      // Save the latest entry in an easy access variable
      const theLatestEntry = this.currentEntries[0]
      // Do the same with the fetched entries
      const theLatestFetchedEntry = fetchedEntries[0]

      log.info('checkForUpdates',
        'The latest current entry is from',
        theLatestEntry.date.humanReadable,
        'with the link to', theLatestEntry.link)
      log.info('checkForUpdates',
        'The latest fetched entry is from',
        theLatestFetchedEntry.date.humanReadable,
        'with the link to', theLatestFetchedEntry.link)

      // Check for trivial "if links aren't the same new entries"
      if (theLatestEntry.link !== theLatestFetchedEntry.link) {
        // This means 1 or more new entries are in the feed
        for (let index = 0; index < fetchedEntries.length; index++) {
          // Walk from the top of the fetched entries and compare each entry
          // to the latest entry (via link)
          if (theLatestEntry.link === fetchedEntries[index].link) {
            // If a fetched entry has the same link as the current one
            // stop adding them to the new entries list
            break
          }
          newEntries.push(fetchedEntries[index])
        }

        log.info('checkForUpdates',
          'Current entry and fetched entry aren\'t the same',
          `${newEntries.length} new entries found`)
      }
    }

    // Check if there are new entries after analysis is finished
    if (newEntries.length > 0) {
      // If yes concatenate the current entries with the new entries
      this.currentEntries = newEntries.concat(this.currentEntries)
      // And update/save cache file
      this.saveCache()
    }

    // Also return all new entries
    return newEntries
  }
  /**
   * Get the current feed entries
   * @param {boolean} [callback=false] Should the set callback be executed
   * @returns {Promise<import('../FETCH/FetchEntriesTypes')
   * .IliasBuddyFetchEntries.Entry[]>}
   */
  getCurrentEntries (callback = false) {
    return new Promise((resolve, reject) => this.fetchEntries
      .getCurrentEntries()
      .then(fetchedEntries => {
        // If the fetched feed entries are not undefined and not empty
        if (fetchedEntries !== undefined && fetchedEntries.length !== 0) {
          // Extract the new entries in relation to the current entries
          const newEntries = this.extractNewEntries(fetchedEntries)
          // If the new entries are not undefined and not empty
          if (newEntries !== undefined && newEntries.length !== 0) {
            // Check if the callback should be executed
            if (callback) { this.newEntriesFoundCallback(newEntries) }
            // And return the new entries
            resolve(newEntries)
          } else {
            // If the new entries are undefined or empty return empty list
            resolve([])
          }
        } else {
          // If the fetched entries are undefined or empty return empty list
          resolve([])
        }
      }).catch(reject))
  }
  /**
   * Save all files (cache + new entries) in a file
   */
  saveCache () {
    // Save the current entries in a file
    FileManager.writeFileSyncAppData(gCacheFilePath,
      JSON.stringify(this.currentEntries))
    // Update cache variable
    cachedEntries = this.currentEntries.slice()
  }
}

module.exports = IliasBuddyManageEntriesApi
