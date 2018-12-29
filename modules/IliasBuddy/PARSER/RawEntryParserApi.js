const moment = require('moment')

class RawEntryParser {
  /**
   * Groups if match:
   * - 1. Course title
   * - 2. Course directory
   * - 3. Forum
   * - 4. Title
   *
   * Examples:
   * - ["Course_title" > "directory_1 > directory_2"] "forum": "title"
   * (https://regex101.com/r/TZTADg/1/)
   *
   * @returns {RegExp} Regular expression to recognize groups
   */
  static getRegex01 () {
    return /^\[(.*?)\s>\s(.*)\]\s(.*):\s(.*)$/
  }
  /**
   * Groups if match:
   * - 1. Course title
   * - 2. Forum
   * - 3. Title
   *
   * Example:
   * - ["Course_title"] "forum": "title" (https://regex101.com/r/YSiMVU/1)
   *
   * @returns {RegExp} Regular expression to recognize groups
   */
  static getRegex02 () {
    return /^\[(.*)\]\s(.*):\s(.*)$/
  }
  /**
   * Function that converts raw entries to better ones
   * @param {import('../FETCH/FetchEntriesTypes').IliasPrivateRssFeed
   * .WholeThingRssChannelItem} rawEntry
   * @returns {import('../FETCH/FetchEntriesTypes').IliasBuddyFetchEntries
   * .RawEntry}
   */
  static parseRawEntry (rawEntry) {
    return {
      description: rawEntry.description._text,
      guid: rawEntry.guid._text,
      link: rawEntry.link._text,
      pubDate: rawEntry.pubDate._text,
      title: rawEntry.title._text
    }
  }
  /**
   * @param {import('../FETCH/FetchEntriesTypes').IliasBuddyFetchEntries
   * .RawEntry} rawEntry
   * @returns {import('./RawEntryParserTypes').IliasBuddyRawEntryParser
   * .Entry} Entry
   */
  static parseToIliasBuddyEntry (rawEntry) {
    const resultObject = {
      course: this.parseCourseTitle(rawEntry.title),
      courseDirectory: this.parseCourseDirectory(rawEntry.title),
      date: this.parseDate(rawEntry.pubDate),
      description: this.parseDescription(rawEntry.description),
      link: this.parseLink(rawEntry.link)
    }

    const tempTitle = this.parseTitle(rawEntry.title)
    const forumFileName = this.parseCourseForumFilename(rawEntry.title)

    let options = {}

    if (this.isFile(tempTitle)) {
      options = {
        ...options,
        file: {
          fileAdded: this.isFileAdded(tempTitle),
          fileName: forumFileName,
          fileUpdated: this.isFileUpdated(tempTitle)
        },
        isFile: true,
        isPost: false
      }
    } else {
      options = {
        ...options,
        isFile: false,
        isPost: true,
        post: {
          forum: forumFileName,
          title: tempTitle
        }
      }
    }
    return { ...resultObject, options }
  }

  /**
   * Extract the post date
   * @param {string} rawDate
   * @returns {{unix: number, humanReadable: string}}
   */
  static parseDate (rawDate) {
    const time = moment(rawDate)
    return {
      humanReadable: time.format('LLLL'),
      unix: time.unix()
    }
  }

  /**
   * Extract the post link
   * @param {string} rawLink
   * @returns {string}
   */
  static parseLink (rawLink) {
    return rawLink
  }

  /**
   * Extract the post course
   */
  static parseCourseTitle (rawTitle) {
    if (this.getRegex01().test(rawTitle)) {
      const match = this.getRegex01().exec(rawTitle)
      return match[1]
    } else if (this.getRegex02().test(rawTitle)) {
      const match = this.getRegex02().exec(rawTitle)
      return match[1]
    }
    throw Error('CourseTitle could not be parsed!',
      `(rawTitle: "${rawTitle}")`)
  }

  /**
   * Extract the post course directory
   * @param {string} rawTitle
   * @returns {string[]}
   */
  static parseCourseDirectory (rawTitle) {
    if (this.getRegex01().test(rawTitle)) {
      const match = this.getRegex01().exec(rawTitle)
      return match[2].split(' > ')
    }

    // console.log('rawTitle:', '"' + rawTitle + '"')
    // throw Error('CourseDirectory could not be parsed!')
    return []
  }

  /**
   * Extract the post course forum / file name
   * @param {string} rawTitle
   * @returns {string}
   */
  static parseCourseForumFilename (rawTitle) {
    if (this.getRegex02().test(rawTitle)) {
      const match = this.getRegex02().exec(rawTitle)
      return match[2]
    }

    throw Error('CourseForumFilename could not be parsed!',
      `(rawTitle: "${rawTitle}")`)
  }

  /**
   * Extract the post description
   * @param {string} rawDescription
   * @returns {string}
   */
  static parseDescription (rawDescription) {
    if (rawDescription !== undefined) {
      // replace all <br> tags with newline characters
      return rawDescription.replace(/<br \/>/g, '<br>').replace(/\\n/g, '<br>')
        .replace(/(<img.*?src=")(.*?)(".*?>)/g,
          (imgTag, imgTagBegin, link, imgTagEnd) => {
            if (link.startsWith('./')) {
              link = link.replace('./', 'https://ilias3.uni-stuttgart.de/')
            }
            /* imgTagBegin + link + imgTagEnd + '<br>' + */
            return '<button onClick="openExternal(\'' + link +
              '\')">Link to picture</button>'
          })
    }
    if (rawDescription === undefined) {
      return ''
    }

    throw Error('Description could not be parsed!',
      `(rawDescription: "${rawDescription}")`)
  }

  /**
   * Extract the forum where the post originates
   * @param {string} rawTitle
   * @returns {string}
   */
  static parseForum (rawTitle) {
    if (this.getRegex02().test(rawTitle)) {
      const match = this.getRegex02().exec(rawTitle)
      return match[2]
    }

    throw Error('Forum could not be parsed!', `rawTitle: "${rawTitle}")`)
  }

  /**
   * @param {string} rawTitle
   * @returns {string}
   */
  static parseTitle (rawTitle) {
    if (this.getRegex02().test(rawTitle)) {
      const match = this.getRegex02().exec(rawTitle)
      return match[3]
    }

    throw Error('Title could not be parsed!', `rawTitle: "${rawTitle}")`)
  }

  /**
   * @param {string} parsedTitle
   * @returns {boolean}
   */
  static isFile (parsedTitle) {
    return this.isFileAdded(parsedTitle) || this.isFileUpdated(parsedTitle)
  }

  /**
   * @param {string} parsedTitle
   * @returns {boolean}
   */
  static isFileAdded (parsedTitle) {
    return parsedTitle === 'File has been added.' ||
      parsedTitle === 'Die Datei wurde hinzugefügt.'
  }

  /**
   * @param {string} parsedTitle
   * @returns {boolean}
   */
  static isFileUpdated (parsedTitle) {
    return parsedTitle === 'File has been updated.' ||
      parsedTitle === 'Die Datei wurde aktualisiert.'
  }
}

module.exports = RawEntryParser
