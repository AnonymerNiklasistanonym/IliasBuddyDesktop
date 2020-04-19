/* =====  Imports  ====== */

// npm modules
// const log = require('electron-log')

/* =====  Module  ====== */

/**
 * Class that enables to search a list of elements with the same data
 */
class SearchManager {
  /**
   * Get if the search bar is focused
   */
  get searchBarIsFocused () {
    return this.input === document.activeElement
  }

  /**
   * Regular expression for the search query
   * - **Group 01** (`[1]`): The group contains either undefined or metadata key
   *   - `key:keyword` = `key`
   *   - `key:"key word"` = `key`
   *   - `keyword` = `undefined`
   *   - `"key word"` = `undefined`
   * - **Group 02** (`[2]`): The group contains either undefined or the keyword
   *   contained in two quotation marks (`"..."`) and separated by two
   *   whitespaces (or the begin/end of the string)
   *   - `key:keyword` = `undefined`
   *   - `key:"key word"` = `key word`
   *   - `keyword` = `undefined`
   *   - `"key word"` = `key word`
   * - **Group 03** (`[3]`): The group contains either undefined or a keyword
   *   separated by two whitespaces (or the begin/end of the string)
   *   - `key:keyword` = `keyword`
   *   - `key:"key word"` = `undefined`
   *   - `keyword` = `keyword`
   *   - `"key word"` = `undefined`
   */
  static get searchQueryExpression () {
    return /(?:\s*?|^\s*)(?:(\w*):)?(?:"(.+?)"|"?(\S+?))(?:(?=\s)|(?=$))/g
  }

  /**
   * Get the parsed search query results
   * @param {string} searchQuery
   * @returns {import('./SearchManagerTypes').SearchManagerParsedQuery[]}
   */
  static getSearchQueryExpressionResults (searchQuery) {
    /**
     * Regular expression matches of the search query
     * @type {{ id: string; query: string; }[]}
     */
    const regexMatches = []
    // Copy search query regular expression
    const regularExpression = SearchManager.searchQueryExpression
    // Find all search query objects
    /**
     * Current regular expression match
     */
    let regexMatch = null
    do {
      // Execute the copied regular expression
      regexMatch = regularExpression.exec(searchQuery)
      // If the regular expression match is not undefined push it to a list
      if (regexMatch !== null) {
        regexMatches.push({
          id: regexMatch[1],
          query: regexMatch[2] !== undefined ? regexMatch[2] : regexMatch[3]
        })
      }
      // If the regular expression match is not undefined repeat the whole thing
    } while (regexMatch !== null)
    return regexMatches
  }

  /**
   * Creates an instance of Search manager
   * @param {HTMLInputElement} inputElement
   * @param {HTMLUListElement} listElement
   * @param {import('./SearchManagerTypes').SearchManagerListFormat[]}
   * listElementFormat
   * @param {import('./SearchManagerTypes').SearchManagerOptions} [options]
   */
  constructor (inputElement, listElement, listElementFormat = [], options) {
    this.input = inputElement
    this.list = listElement
    this.listElementDataFormat = listElementFormat
    this.options = options === undefined ? {} : options
    if (this.options.customHideWindowTag === undefined) {
      this.options.customHideWindowTag = 'search-hide'
    }
    // Create input listeners
    this.input.addEventListener('input', () => {
      // On input change search again
      this.search(this.input.value)
    })
  }

  /**
   * Focus the search bar
   */
  focusSearchBar () {
    this.input.focus()
  }

  /**
   * Display all list elements (show all hidden ones by executing this method)
   */
  showAllElements () {
    const children = this.list.children
    for (let i = 0; i < children.length; i++) {
      children[i].classList.remove(this.options.customHideWindowTag)
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
      this.showAllElements()
      return
    }
    /**
     * Regular expression matches of the search query
     */
    const queries = SearchManager.getSearchQueryExpressionResults(query)
    // Check if there are zero keywords and if yes return and show all elements
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
        listElement.classList.remove(this.options.customHideWindowTag)
      } else {
        listElement.classList.add(this.options.customHideWindowTag)
      }
    }
  }
}

/* =====  Exports  ====== */

module.exports = SearchManager
