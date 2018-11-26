export namespace IliasBuddyApi {

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
