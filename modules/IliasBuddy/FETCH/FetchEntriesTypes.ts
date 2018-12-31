export namespace IliasBuddyFetchEntries {

  export interface Entry {
      /**
       * Entry options
       */
      options?: EntryOptions;
      /**
       * Course name
       */
      course: string;
      /**
       * Entry date
       */
      date: EntryDate;
      /**
       * Link to Ilias page of post/file
       */
      link: string;
      /**
       * Course directory of post forum or file location
       */
      courseDirectory: string[];
      /**
       * Entry description
       */
      description: string;
  }

  export interface EntryDate {
    /**
     * Date in UNIX time
     */
    unix: number;
    /**
     * A human readable time string
     */
    humanReadable: string;
}

  export interface EntryOptions {
      /**
       * Specifies if the entry is a post
       */
      isPost?: boolean;
      /**
       * Specifies if the entry is a file
       */
      isFile?: boolean;
      /**
       * If the entry is a file in here is additional information to the default
       * data
       */
      file?: EntryOptionsFile;
      /**
       * If the entry is a post in here is additional information to the default
       * data
       */
      post?: EntryOptionsPost;
  }

  export interface EntryOptionsPost {
      /**
       * The title of the post
       */
      title: string;
      /**
       * The forum in which the post was created
       */
      forum: string;
  }

  export interface EntryOptionsFile {
      /**
       * True if file was added
       */
      fileAdded?: boolean;
      /**
       * True if file was updated
       */
      fileUpdated?: boolean;
      /**
       * Name of the file
       */
      fileName?: string;
  }

  export interface RawEntry {
      /**
       * The Ilias entry title
       * @example ["Course_title"] "forum": "title"
       * @example ["Course_title" > "directory_n" > "..."] "forum": "title"
       */
      title: string;
      /**
       * Link to Ilias entry
       */
      link: string;
      /**
       * Description of Ilias entry
       */
      description: string;
      // TODO Add example of time string
      /**
       * The publishing date
       */
      pubDate: string;
      // TODO Use this in the future as identifier, because it's guaranteed to
      // be unique
      /**
       * Unique identifier URL of entry
       */
      guid: string;
  }
}

export namespace IliasPrivateRssFeed {
  interface WholeThingDeclarationAttributes {
      // TODO Check this
      /**
       * Version of RSS
       */
      version: string;
      /**
       * Encoding of string
       */
      encoding: string;
  }
  interface WholeThingDeclaration {
      // TODO Check this
      /**
       * Attribute TODO
       */
      _attributes: WholeThingDeclarationAttributes;
  }
  interface WholeThingRssAttributes {
      // TODO Check this
      /**
       * RSS version
       */
      version: string;
  }
  /**
   * Channel tag (ROOT of RSS feed)
   */
  interface WholeThingRssChannel {
      /**
       * Title of RSS feed object
       * @example "<title>...</title>"
       */
      title: {
          /**
           * Title of RSS feed
           * @example "ILIAS für Lehre & Lernen – Universität Stuttgart"
           */
          _text: string;
      };
      /**
       * Link of RSS feed object
       * @example "<link>...</link>"
       */
      link: {
          /**
           * Link to ilias
           * @example https://ilias3.uni-stuttgart.de
           */
          _text: string;
      };
      /**
       * The ilias entries, CAN BE EMPTY!
       */
      item?: WholeThingRssChannelItem[];
  }
  export interface WholeThingRssChannelItem {
      /**
       * The Ilias entry title object
       */
      title: {
          /**
           * The Ilias entry title
           * @example ["Course_title"] "forum": "title"
           * @example ["Course_title" > "directory_n" > "..."] "forum": "title"
           */
          _text: string;
      };
      /**
       * The Ilias entry link object
       */
      link: {
          /**
           * The Ilias entry link
           */
          _text: string;
      };
      /**
       * The Ilias entry description object
       */
      description: {
          /**
           * The Ilias entry description
           */
          _text: string;
      };
      /**
       * The Ilias entry published date object
       */
      pubDate: {
          // TODO Add example of time string
          /**
           * The Ilias entry published date string
           * @example TODO
           */
          _text: string;
      };
      /**
       * The Ilias unique URL object
       */
      guid: {
          /**
           * The Ilias unique URL
           */
          _text: string;
      };
  }
  // TODO Check this
  /**
   * The root of the whole object with the channel tag being the main tag in
   * which everything else is wrapped (`<channel>...</channel>`)
   */
  interface WholeThingRss {
      // TODO Check this
      /**
       * Attributes to RSS tag
       */
      _attributes: WholeThingRssAttributes;
      /**
       * The root tag (channel tag - `<channel>...</channel>`)
       */
      channel: WholeThingRssChannel;
  }
  // TODO Check this
  /**
   * The root of everything?
   */
  export interface WholeThing {
      // TODO Check this
      /**
       * TODO
       */
      _declaration: WholeThingDeclaration;
      // TODO Check this
      /**
       * TODO
       */
      rss: WholeThingRss;
  }
}
