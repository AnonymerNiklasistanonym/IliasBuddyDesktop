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
   * Do a search which automatically hides not results and sorts them
   * accordingly
   * @param {string} query
   */
  search (query) {
    const children = this.list.children
    if (query === undefined || query === '') {
      for (let i = 0; i < children.length; i++) {
        children[i].classList.remove('search-hide')
      }
      return
    }
    // Iterate over all list elements
    for (let i = 0; i < children.length; i++) {
      const listElement = children[i]
      console.debug(listElement)
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
      const display = dataList.map(el => el.data.toUpperCase())
        .find(element => element.includes(query.toUpperCase())) !== undefined
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
