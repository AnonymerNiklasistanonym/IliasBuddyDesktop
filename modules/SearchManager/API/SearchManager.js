const log = require('electron-log')

/**
 * Class that enables to search a list of elements with the same data
 */
class SearchManager {
  /**
   * Creates an instance of Search manager
   * @param {HTMLInputElement} inputElement
   * @param {HTMLUListElement} listElement
   * @param {import('./SearchManagerTypes').SearchManagerListFormat[]}
   * listElementFormat
   */
  constructor (inputElement, listElement, listElementFormat = []) {
    this.input = inputElement
    this.list = listElement
    this.listElementDataFormat = listElementFormat
    // Create input listeners
    this.input.addEventListener('input', () => {
      // On input change search again
      this.search(this.input.value)
    })
  }
  showAllElements () {
    const children = this.list.children
    for (let i = 0; i < children.length; i++) {
      children[i].classList.remove('search-hide')
    }
  }
  /**
   * Do a search which automatically hides not results and sorts them
   * accordingly
   * @param {string} query
   * @example search('')
   * @example search(' ')
   * @example search('searchEverywhere')
   * @example search('searchEverywhere searchEverywhere  ')
   */
  // tslint:disable-next-line: cyclomatic-complexity
  search (query) {
    const children = this.list.children
    if (query === undefined || query === '') {
      log.debug('Search query was empty')
      this.showAllElements()
      return
    }
    // Find all queries
    let m
    const regexMatches = []
    // TODO Regex needs to optimized to recognize description:"Content"
    // TODO To easily search specific sections of the list entries
    // tslint:disable-next-line: max-line-length
    const regularExpression = /(?:\s*?|^\s*)(?:"(.+?)"|"?(\S+?))(?:(?=\s)|(?=$))/g
    do {
      m = regularExpression.exec(query)
      if (m) {
        // Group 02: searchEverywhere (This will be the found keywords)
        // Group 01: "search everywhere" (This will be the found keywords)
        regexMatches.push(m[1] !== undefined ? m[1] : m[2])
      }
    } while (m)

    console.log(regexMatches)

    const queries = regexMatches
    if (queries.length === 0) {
      log.debug('Search query was not empty, but only spaces')
      this.showAllElements()
      return
    }
    // Iterate over all list elements
    for (let i = 0; i < children.length; i++) {
      const listElement = children[i]
      /**
       * @type {{ name: string; data: string; }[]}
       */
      const dataList = []
      // Iterate over data formats to extract data of each list element
      for (let j = 0; j < this.listElementDataFormat.length; j++) {
        const dataFormat = this.listElementDataFormat[j]
        const dataElement = listElement.querySelector(dataFormat.querySelector)
        const data = dataElement !== null ? dataElement.textContent : ''
        console.debug(dataFormat.name + ':', data)
        dataList.push({ name: dataFormat.name, data })
      }
      // Iterate over data and check if search should display this element
      const display = queries.filter(queryElement =>
        dataList.filter(dataElement => {
          const elementData = dataElement.data.toUpperCase()
          const queryString = queryElement.toUpperCase()
          return elementData.includes(queryString)
        }).length > 0).length === queries.length
      // Hide/Show list element
      if (display) {
        listElement.classList.remove('search-hide')
      } else {
        listElement.classList.add('search-hide')
      }
    }
  }
}

module.exports = SearchManager
