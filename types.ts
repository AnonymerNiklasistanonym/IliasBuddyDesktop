import { Hidden, Modifiable } from "./modules/Settings/API/SettingsTypes";

/**
 * Settings set information object that is necessary to determine the DOM object
 * which was set, it's type in settings for type-checks and the id of the setting
 * object to set it (or get the default value)
 */
export interface SettingsResetInfoObject {
    /**
     * The id of the setting
     */
    id: Modifiable.SettingsId;
    /**
     * The id of the DOM <input> tag
     */
    documentId: string;
    /**
     * The type of the setting for type checking
     * TODO: Remove this and determine this internally
     */
    type: Modifiable.SettingsTypeName;
}

export interface SettingsReset extends SettingsResetInfoObject { }
export interface SettingsResetAnswer extends SettingsReset {
    defaultValue: any;
}

export interface SettingsSet extends SettingsResetInfoObject {
    value: any;
    restart: boolean;
}
export interface SettingsSetAnswer extends SettingsSet { }

export interface OpenWindow {
    screenId: string;
}
