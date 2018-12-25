import { Modifiable } from "./modules/Settings/API/SettingsTypes";

/**
 * Settings set information object that is necessary to determine the DOM object
 * which was set, it's type in settings for type-checks and the id of the
 * setting object to set it (or get the default value)
 */
export interface SettingsResetInfoObject {
    /**
     * The id of the setting
     */
    id: Modifiable.SettingsId;
    /**
     * The id of the DOM `<input>` tag to be reset
     */
    documentId: string;
}

export interface SettingsResetAnswer extends SettingsResetInfoObject {
    valueDefault: any;
}

export interface SettingsSet extends SettingsResetInfoObject {
    value: any;
    restart: boolean;
}

export interface OpenWindow {
    screenId: string;
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
        errorMessage?: string;
        url?: {
            value: string;
            defaultValue: string;
        };
        password?: {
            value: string;
            defaultValue: string;
        };
        name?: {
            value: string;
            defaultValue: string;
        };
    }
}
