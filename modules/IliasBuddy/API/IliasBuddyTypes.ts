export namespace IliasBuddyApi {

    /**
     * New entries found callback
     * @param newEntries The new entries from the latest feed to the current
     * cached ones
     */
    export type NewEntriesFoundCallback = (newEntries: Entry[]) => void;

    // TODO Use only this entry interface in the whole project to minimize code
    // and centralize the important types in this document
    /**
     * Ilias entry object
     */
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
         * If the entry is a file in here is additional information to the
         * default data
         */
        file?: EntryOptionsFile;
        /**
         * If the entry is a post in here is additional information to the
         * default data
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

}
