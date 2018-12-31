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

    // Hidden settings object

    /**
     * `"restartInfo"` object
     */
    interface RestartInfo {
        /**
         * Should a screen be opened after launch
         */
        openScreen: boolean;
        /**
         * Which screen should be opened
         */
        screenId: string;
    }

    /**
     * `"windowBounds"` object
     */
    interface WindowBounds {
        /**
         * Height of the window
         */
        height: number;
        /**
         * Width of the window
         */
        width: number;
        /**
         * X position of the window
         */
        x: number;
        /**
         * Y position of the window
         */
        y: number;
    }

    /**
     * `"minWindowBounds"` object
     */
    interface MinWindowBounds {
        /**
         * Minimum height of the window
         */
        height: number;
        /**
         * Minimum width of the window
         */
        width: number;
    }

    // TODO Integrate later in the code
    /**
     * `"savedLinks"` array object
     */
    interface FutureIliasBuddyLinkEntry {
        /**
         * Description of the link
         */
        description: string;
        /**
         * The web link itself
         */
        link: string;
        /**
         * The name to easily search/find it
         */
        name: string;
    }

    // TODO Integrate later in the code
    /**
     * `"sort"` sort option object
     */
    type FutureIliasBuddySortOptions = "date" | "title" | "course";
    /**
     * `"sort"` array object
     */
    interface FutureIliasBuddySort {
        /**
         * Sort after this options ascending or not
         */
        ascending: boolean;
        /**
         * Sort by the following sort option
         */
        by: FutureIliasBuddySortOptions;
    }

    // TODO Integrate later in the code
    /**
     * `"searchFilter"` search filter option object
     */
    type FutureIliasBuddyFilterOptions = "date" | "title" | "course";
    /**
     * `"searchFilter"` search filter object
     */
    interface FutureIliasBuddySearch {
        /**
         * Filter after an array of options
         */
        filter: FutureIliasBuddyFilterOptions[];
        /**
         * The search query
         */
        query: string;
    }

    /**
     * Settings object [Hidden settings]
     */
    export interface SettingsObjectDefault {
        /**
         * The id of the setting
         */
        id: SettingsId;
        /**
         * An explanation what the purpose of this setting is
         */
        info?: string;
        /**
         * The default value of the setting
         */
        valueDefault: any;
    }

    /**
     * Settings object local [Hidden settings]
     */
    export interface SettingsObjectLocal {
        /**
         * The id of the setting
         */
        id: SettingsId;
        /**
         * The local/current value of the setting
         */
        value: any;
    }

    /**
     * Settings object with local/current value [Hidden settings]
     */
    export interface SettingsObjectMerged extends SettingsObjectDefault {
        /**
         * The value of the setting
         */
        value: any;
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
        "checkForFeedCronJobConfiguration" | "autoLaunch" |
        "globalShortcutShow";
    /**
     * All defined settings types [Modifiable settings]
     */
    export type SettingsTypeName = "toggle" | "text" | "password" | "cronJob" |
        "url" | "keyboardShortcut";

    /**
     * Settings object [Modifiable settings]
     */
    export interface SettingsObjectDefault {
        /**
         * The id of the setting
         */
        id: SettingsId;
        /**
         * The default value of the setting
         */
        valueDefault: any;
        /**
         * The type of the setting
         */
        type: SettingsTypeName;
        /**
         * Information object about the setting
         */
        info: SettingsObjectDefaultInfo;
        /**
         * Is a restart needed after changing this setting
         */
        restart?: boolean;
    }

    interface SettingsObjectDefaultInfo {
        /**
         * The description/explanation of the setting (For display in modifiable
         * settings list and explanation without looking in the code)
         */
        description: string;
        /**
         * The name of the setting (For display in modifiable settings list)
         */
        name: string;
    }

    /**
     * Settings object local [Modifiable settings]
     */
    export interface SettingsObjectLocal {
        /**
         * The id of the setting
         */
        id: SettingsId;
        /**
         * The local/current value of the setting
         */
        value: any;
    }

    /**
     * Settings object with local/current value [Modifiable settings]
     */
    export interface SettingsObjectMerged extends SettingsObjectDefault {
        /**
         * The local/current value of the setting
         */
        value: any;
    }
}

/**
 * Default settings JSON object
 */
export interface SettingsJsonDefault {
    /**
     * Contains all default settings
     */
    settings: {
        /**
         * The hidden default settings
         */
        hidden: Hidden.SettingsObjectDefault[];
        /**
         * The modifiable default settings
         */
        modifiable: Modifiable.SettingsObjectDefault[];
    };
    // TODO Create callback when version is different to local version
    /**
     * The version to migrate for breaking changes
     */
    version: number;
}

/**
 * Local settings JSON object
 */
export interface SettingsJsonLocal {
    /**
     * Contains all local settings
     */
    settings?: {
        /**
         * The hidden local settings
         */
        hidden?: Hidden.SettingsObjectLocal[];
        /**
         * The modifiable local settings
         */
        modifiable?: Modifiable.SettingsObjectLocal[];
    };
    // TODO Add version
    /**
     * The version to migrate for breaking changes
     */
    version?: number;
}
