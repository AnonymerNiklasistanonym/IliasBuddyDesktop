export interface SearchManagerListFormat {
  /**
   * Identifier of element text content
   */
  name: string;
  /**
   * Query selector of element text content
   */
  querySelector: string;
}

export interface SearchManagerOptions {
  /**
   * Custom tag that will be added to list elements that are not search results
   */
  customHideWindowTag?: string;
}

export interface SearchManagerParsedQuery {
  /**
   * Id of property, CAN BE UNDEFINED
   */
  id?: string;
  /**
   * Search query (keyword)
   */
  query: string;
}
