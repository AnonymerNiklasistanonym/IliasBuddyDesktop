// TODO Can it be that this interface can be found elsewhere? If yes remove one

export namespace IliasBuddyRawEntryParser {

    export interface Entry {
        /**
         * Additional options (isFile, additional information, ...)
         */
        options?: EntryOptions;
        /**
         * Course of Ilias entry
         */
        course: string;
        /**
         * Published date of Ilias entry
         */
        date: DateObject;
        /**
         * Link to Ilias entry
         */
        link: string;
        /**
         * Course directory list in which each directory is a string, CAN BE AN
         * EMPTY LIST!
         */
        courseDirectory: string[];
        /**
         * Description of entry, CAN BE AN EMPTY STRING!
         */
        description: string;
    }

    export interface DateObject {
        /**
         * Date in Unix time format
         */
        unix: number;
        /**
         * Date in a human readable format
         */
        humanReadable: string;
    }

    export interface EntryOptions {
        /**
         * Entry is a post if true
         */
        isPost?: boolean;
        /**
         * Entry is a file (update) if true
         */
        isFile?: boolean;
        /**
         * Additional information if isFile is true
         */
        file?: EntryOptionsFile;
        /**
         * Additional information if isPost is true
         */
        post?: EntryOptionsPost;
    }

    export interface EntryOptionsPost {
        /**
         * Title string of post
         */
        title: string;
        /**
         * Forum name string of post
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
         * File name string
         */
        fileName?: string;
    }

}
