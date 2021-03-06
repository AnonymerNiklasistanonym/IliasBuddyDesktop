/* ===== << Imports >> ====== */

const RendererEntries = require('../GUI/RendererEntriesApi')
const ManageEntries = require('../MANAGER/ManageEntriesApi')
const log = require('electron-log')

/* ===== >> Imports << ====== */

/**
 * API to easily manage to get feed updates, cached entries, etc.
 */
class IliasBuddyApi {
  /**
   * Get the already cached entries
   */
  static getCache () {
    return ManageEntries.getCachedEntries()
  }

  /**
   * Test if a connection with a `200` response can be established
   * @param {string} url Private Ilias feed URL
   * @param {string} userName Private Ilias feed user name for authentication
   * @param {string} password Private Ilias feed password for authentication
   * @returns {Promise<void>}
   */
  static testConnection (url, userName, password) {
    log.debug('IliasBuddyApi, testConnection')
    return ManageEntries.testConnection(url, userName, password)
  }

  /**
   * Get the current Ilias entries as HTML elements
   * @param {import('../PARSER/RawEntryParserTypes')
   * .IliasBuddyRawEntryParser.Entry[]} entries
   * @returns {string[]}
   */
  static renderEntriesHtml (entries) {
    return entries.map(RendererEntries.render.bind(RendererEntries))
  }

  /**
   * Creates an instance of IliasBuddyApi
   * @param {string} url Private Ilias RSS feed url
   * @param {string} userName Private Ilias RSS feed username
   * @param {string} password Private Ilias RSS feed password
   * @param {import('../API/IliasBuddyTypes').IliasBuddyApi
   * .NewEntriesFoundCallback} newEntriesFoundCallback
   */
  constructor (url, userName, password, newEntriesFoundCallback) {
    this.manageEntries = new ManageEntries(url, userName, password,
      newEntriesFoundCallback)
  }

  /**
   * Get the current feed entries
   * @param {boolean} [callback=false] Should the set callback be executed
   * @returns {Promise<import('../FETCH/FetchEntriesTypes')
   * .IliasBuddyFetchEntries.Entry[]>}
   */
  getCurrentEntries (callback = false) {
    return this.manageEntries.getCurrentEntries(callback)
  }
}

module.exports = IliasBuddyApi
