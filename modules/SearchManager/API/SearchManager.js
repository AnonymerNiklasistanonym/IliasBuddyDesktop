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
  /**
   * Display all list elements (show all hidden ones by executing this method)
   */
  showAllElements () {
    const children = this.list.children
    for (let i = 0; i < children.length; i++) {
      children[i].classList.remove('search-hide')
    }
  }
  /**
   * Do a search which automatically hides list elements that aren't matches
   * @param {string} query
   * @example search('')
   * @example search('searchEverywhere')
   * @example search('  searchEverywhere  searchEverywhere  ')
   * @example search('"search everywhere" searchEverywhere')
   * @example search('"search everywhere" description:searchDescription')
   * @example search('title:"search only metadata title text content"')
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
    /**
     * @type {{ id: string; query: string; }[]}
     */
    const regexMatches = []
    // (?:\s*?|^\s*)(?:"(.+?)"|"?(\S+?))(?:(?=\s)|(?=$))
    // Group 02: searchEverywhere (This will be the found keywords)
    // Group 01: "search everywhere" (This will be the found keywords)
    // tslint:disable-next-line: max-line-length
    const regularExpression = /(?:\s*?|^\s*)(?:(\w*):)?(?:"(.+?)"|"?(\S+?))(?:(?=\s)|(?=$))/g
    do {
      m = regularExpression.exec(query)
      if (m) {
        // Group 01: description: (This will be the found keyword)
        // Group 02: "search everywhere" (This will be the found keyword)
        // Group 03: searchEverywhere (This will be the found keyword)
        regexMatches.push({
          id: m[1],
          query: m[2] !== undefined ? m[2] : m[3]
        })
      }
    } while (m)

    const queries = regexMatches
    if (queries.length === 0) {
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
      const display = queries.filter(queryElement => {
        // Check if a specific property is wanted
        if (queryElement.id !== undefined) {
          // Check if the data list has this property
          const indexD = dataList.findIndex(a => a.name === queryElement.id)
          if (indexD > -1) {
            const elementData = dataList[indexD].data.toUpperCase()
            const queryString = queryElement.query.toUpperCase()
            return elementData.includes(queryString)
          }
          // If not ignore it
        }
        // Else check all properties for at least one match
        return dataList.filter(dataElement => {
          const elementData = dataElement.data.toUpperCase()
          const queryString = queryElement.query.toUpperCase()
          return elementData.includes(queryString)
        }).length > 0
      }).length === queries.length
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
