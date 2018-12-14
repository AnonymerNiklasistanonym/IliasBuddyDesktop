export namespace IliasBuddyRawEntryParser {

    export interface Entry {
        options?: EntryOptions;
        course: string;
        date: DateObject;
        link: string;
        courseDirectory: string[];
        description: string;
    }

    export interface DateObject {
        unix: number;
        humanReadable: string;
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

}
