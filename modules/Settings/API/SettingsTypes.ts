import {
    IliasBuddyFetchEntries,
} from "../../IliasBuddy/FETCH/FetchEntriesTypes";

export namespace Hidden {
    /**
     * All defined settings ids [Hidden settings]
     */
    export type SettingsId = "restartInfo" | "windowBounds" |
        "minWindowBounds" | "searchFilter" | "sort" | "savedEntries" |
        "savedLinks" | "githubLatestReleaseUrl";
    /**
     * All defined settings values [Hidden settings]
     */
    export type SettingsType =
        RestartInfo |
        WindowBounds |
        MinWindowBounds |
        FutureIliasBuddySearch |
        FutureIliasBuddySort[] |
        IliasBuddyFetchEntries.Entry[] |
        FutureIliasBuddyLinkEntry[] |
        string;

    interface RestartInfo {
        openScreen: boolean;
        screenId: string;
    }

    interface WindowBounds {
        height: number;
        width: number;
        x: number;
        y: number;
    }

    interface MinWindowBounds {
        height: number;
        width: number;
    }

    interface FutureIliasBuddyLinkEntry {
        description: string;
        link: string;
        name: string;
    }

    type FutureIliasBuddySortOptions = "date" | "title" | "course";
    interface FutureIliasBuddySort {
        ascending: boolean;
        by: FutureIliasBuddySortOptions;
    }
    type FutureIliasBuddyFilterOptions = "date" | "title" | "course";
    interface FutureIliasBuddySearch {
        filter: FutureIliasBuddyFilterOptions[];
        query: string;
    }

    /**
     * Settings object [Hidden settings]
     */
    export interface SettingsObjectDefault {
        id: SettingsId;
        info?: string;
        valueDefault: SettingsType;
    }

    /**
     * Settings object local [Hidden settings]
     */
    export interface SettingsObjectLocal {
        id: SettingsId;
        value: SettingsType;
    }

    /**
     * Settings object with local/current value [Hidden settings]
     */
    export interface SettingsObjectMerged extends SettingsObjectDefault {
        value: SettingsType;
    }
}

export namespace Modifiable {
    /**
     * All defined settings ids [Modifiable settings]
     */
    export type SettingsId = "nativeTitleBar" | "userName" | "userUrl" |
        "userPassword" | "minimizeToSystemTray" | "devMode" |
        "checkForUpdatesOnStartup" | "checkForUpdatesCronJob" |
        "checkForUpdatesCronJobConfiguration" | "checkForFeedCronJob" |
        "checkForFeedCronJobConfiguration" | "autoLaunch";
    /**
     * All defined settings types [Modifiable settings]
     */
    export type SettingsTypeName = "toggle" | "text" | "password" | "cronJob" |
        "url";
    /**
     * All defined settings values [Modifiable settings]
     */
    export type SettingsType = any;

    /**
     * Settings object [Modifiable settings]
     */
    export interface SettingsObjectDefault {
        id: SettingsId;
        valueDefault: SettingsType;
        type: SettingsType;
        info: SettingsObjectDefaultInfo;
        restart?: boolean;
        // TODO - FUTURE
        /**
         * The default value cannot be the value
         */
        noDefaultValueAsValue?: boolean;
    }

    interface SettingsObjectDefaultInfo {
        description: string;
        name: string;
    }

    /**
     * Settings object local [Modifiable settings]
     */
    export interface SettingsObjectLocal {
        id: SettingsId;
        value: SettingsType;
    }

    /**
     * Settings object with local/current value [Modifiable settings]
     */
    export interface SettingsObjectMerged extends SettingsObjectDefault {
        value: SettingsType;
    }
}

/**
 * Default settings JSON object
 */
export interface SettingsJsonDefault {
    settings: {
        hidden: Hidden.SettingsObjectDefault[];
        modifiable: Modifiable.SettingsObjectDefault[];
    };
    version: number;
}

/**
 * Local settings JSON object
 */
export interface SettingsJsonLocal {
    settings?: {
        hidden?: Hidden.SettingsObjectLocal[];
        modifiable?: Modifiable.SettingsObjectLocal[];
    };
    version?: number;
}
