export namespace IliasBuddyFetchEntries {

  export interface Entry {
      options?: EntryOptions;
      course: string;
      date: {
          unix: number;
          humanReadable: string;
      };
      link: string;
      courseDirectory: string[];
      description: string;
  }

  export interface EntryOptions {
      isPost?: boolean;
      isFile?: boolean;
      file?: EntryOptionsFile;
      post?: EntryOptionsPost;
  }

  export interface EntryOptionsPost {
      title: string;
      forum: string;
  }

  export interface EntryOptionsFile {
      fileAdded?: boolean;
      fileUpdated?: boolean;
      fileName?: string;
  }

  export interface RawEntry {
      title: string;
      link: string;
      description: string;
      pubDate: string;
      guid: string;
  }
}

export namespace IliasPrivateRssFeed {
  interface WholeThingDeclarationAttributes {
      version: string;
      encoding: string;
  }
  interface WholeThingDeclaration {
      _attributes: WholeThingDeclarationAttributes;
  }
  interface WholeThingRssAttributes {
      version: string;
  }
  interface WholeThingRssChannel {
      title: {
          _text: string;
      };
      link: {
          _text: string;
      };
      item: WholeThingRssChannelItem[];
  }
  export interface WholeThingRssChannelItem {
      title: {
          _text: string;
      };
      link: {
          _text: string;
      };
      description: {
          _text: string;
      };
      pubDate: {
          _text: string;
      };
      guid: {
          _text: string;
      };
  }
  interface WholeThingRss {
      _attributes: WholeThingRssAttributes;
      channel: WholeThingRssChannel;
  }
  export interface WholeThing {
      _declaration: WholeThingDeclaration;
      rss: WholeThingRss;
  }
}
