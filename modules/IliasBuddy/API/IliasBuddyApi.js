/* ===== << Imports >> ====== */

const RendererEntries = require('../GUI/RendererEntriesApi')
const FetchEntries = require('../FETCH/FetchEntriesApi')
const ManageEntries = require('../MANAGER/ManageEntriesApi')

/* ===== >> Imports << ====== */

class IliasBuddyApi {
  /**
   * Creates an instance of IliasBuddyApi
   * @param {string} url Private Ilias RSS feed url
   * @param {string} userName Private Ilias RSS feed username
   * @param {string} password Private Ilias RSS feed password
   * @param {function(*[]): void} newEntriesFoundCallback
   */
  constructor (url, userName, password, newEntriesFoundCallback) {
    this.manageEntries = new ManageEntries(url, userName, password,
      newEntriesFoundCallback)
  }
  /**
   * Get the current Ilias entries
   * @returns {Promise<import('../PARSER/RawEntryParserTypes').IliasBuddyRawEntryParser.Entry[]>}
   */
  getCurrentEntries () {
    return this.manageEntries.getCurrentEntries()
  }
  getCache () {
    return this.manageEntries.currentEntries
  }
  /**
   * Get the current Ilias entries as HTML elements
   * @param {import('../PARSER/RawEntryParserTypes').IliasBuddyRawEntryParser.Entry[]} entries
   * @returns {HTMLLIElement[]}
   */
  static renderEntriesHtml (entries) {
    return entries.map(RendererEntries.render.bind(RendererEntries))
  }
}

module.exports = IliasBuddyApi
