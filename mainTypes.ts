import { Modifiable } from "./modules/Settings/API/SettingsTypes";

/**
 * Settings set information object that is necessary to determine the DOM object
 * which was set, it's type in settings for type-checks and the id of the
 * setting object to set it (or get the default value)
 */
export interface SettingsResetQuestion {
    /**
     * The id of the setting
     */
    id: Modifiable.SettingsId;
    /**
     * The id of the DOM `<input>` tag to be reset
     */
    documentId: string;
}

export interface SettingsResetAnswer extends SettingsResetQuestion {
    /**
     * The default value
     */
    valueDefault: Modifiable.SettingsType;
}

export interface SettingsSet extends SettingsResetQuestion {
    /**
     * App needs to be restarted to take effect
     */
    restart: boolean;
    /**
     * Value of the setting
     */
    value: Modifiable.SettingsType;
}

export interface OpenWindow {
    /**
     * ID of the screen that should be opened on start
     */
    screenId: string;
}

export interface SetCronJobOptions {
    /**
     * Run the cron job directly after it was enabled
     */
    runInitially?: boolean;
}

/**
 * Inter process communication types
 */
export namespace IPC {
    /**
     * Ilias login update object
     */
    export interface IliasLoginUpdate {
        /**
         * Ilias API is ready (state is known)
         */
        ready: boolean;
        /**
         * Ilias API state (state is known)
         */
        iliasApiState?: boolean;
        /**
         * Optional error message in case of a wrong login
         */
        errorMessage?: string;
        /**
         * The URL information of the Ilias login
         */
        url?: IliasLoginUpdateValueUrl;
        /**
         * The password information of the Ilias login
         */
        password?: IliasLoginUpdateValuePassword;
        /**
         * The user name information of the Ilias login
         */
        name?: IliasLoginUpdateValueUserName;
    }
    interface IliasLoginUpdateValueUserName {
        /**
         * The current value
         */
        value: string;
        /**
         * The default value
         */
        defaultValue: string;
    }
    interface IliasLoginUpdateValueUrl {
        /**
         * The current value
         */
        value: string;
        /**
         * The default value
         */
        defaultValue: string;
    }
    interface IliasLoginUpdateValuePassword {
        /**
         * The default value
         */
        defaultValue: string;
    }
}

export interface CheckIliasLogin {
    /**
     * User name for Ilias login
     */
    userName?: string;
    /**
     * Password for user name for Ilias login
     */
    password?: string;
    /**
     * URL of Ilias feed that requires the Ilias login
     */
    userUrl?: string;
}

export interface NewVersionDetected {
    /**
     * Date when the new version became available
     */
    date: string;
    /**
     * New version string
     */
    newVersion: string;
    /**
     * Link to download page of new version
     */
    url: string;
}
