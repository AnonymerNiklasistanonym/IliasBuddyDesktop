import { IliasBuddyFetchEntries } from "../../IliasBuddy/FETCH/FetchEntriesTypes";

export namespace Hidden {
    /**
     * All defined settings ids [Hidden settings]
     */
    export type SettingsId = "restartInfo" | "windowBounds" | "minWindowBounds" |
        "searchFilter" | "sort" | "savedEntries" | "savedLinks" | "githubLatestReleaseUrl";
    /**
     * All defined settings values [Hidden settings]
     */
    export type SettingsType =
        { openScreen: boolean, screenId: string } |
        { height: number, width: number, x: number, y: number } |
        { height: number, width: number } |
        { options: [{ filter: boolean, id: string }], query: string } |
        [{ ascending: boolean, by: string, on: boolean }] |
        IliasBuddyFetchEntries.Entry[] |
        [{ name: string, description: string, link: string }] |
        string;

    /**
     * Settings object [Hidden settings]
     */
    export interface SettingsObjectDefault {
        id: SettingsId;
        valueDefault: SettingsType;
    };

    /**
     * Settings object local [Hidden settings]
     */
    export interface SettingsObjectLocal {
        id: SettingsId;
        value: SettingsType;
    };

    /**
     * Settings object with local/current value [Hidden settings]
     */
    export interface SettingsObjectMerged extends SettingsObjectDefault {
        value: SettingsType;
    };
}

export namespace Modifiable {
    /**
     * All defined settings ids [Modifiable settings]
     */
    export type SettingsId = "nativeTitleBar" | "userName" | "userUrl" | "userPassword" |
        "minimizeToSystemTray" | "devMode" | "checkForUpdatesOnStartup" |
        "checkForUpdatesCronJob" | "checkForUpdatesCronJobConfiguration" |
        "checkForFeedCronJob" | "checkForFeedCronJobConfiguration" | "autoLaunch";
    /**
     * All defined settings types [Modifiable settings]
     */
    export type SettingsTypeName = "toggle" | "text" | "password" | "cronJob" | "url";
    /**
     * All defined settings values [Modifiable settings]
     */
    export type SettingsType = boolean | string;

    /**
     * Settings object [Modifiable settings]
     */
    export interface SettingsObjectDefault {
        id: SettingsId;
        valueDefault: SettingsType;
        type: SettingsType;
        info: { description: string; name: string; };
        restart?: boolean;
    };

    /**
     * Settings object local [Modifiable settings]
     */
    export interface SettingsObjectLocal {
        id: SettingsId;
        value: SettingsType;
    };

    /**
     * Settings object with local/current value [Modifiable settings]
     */
    export interface SettingsObjectMerged extends SettingsObjectDefault {
        value: SettingsType;
    };
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
