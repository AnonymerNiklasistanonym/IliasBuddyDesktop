const fs = require('fs')
const path = require('path')
const FileManager = require('../../FileManager/API/FileManager')

const settingsPaths = {
  default: path.join(__dirname, '../../../default_settings.json'),
  local: path.join('settings.json')
}

// 1) Load default settings
/**
 * @type {import('../API/SettingsTypes').SettingsJsonDefault}
 */
const defaultSettings = JSON.parse(fs.readFileSync(settingsPaths.default)
  .toString())

// 2) Load local settings
// 2.1) Check if a local settings file is existing
// 2.2) If yes load them, else assign the empty settings object
/**
 * @type {import('../API/SettingsTypes').SettingsJsonLocal}
 */
const localSettings = FileManager.fileExistsSyncAppData(settingsPaths.local)
  ? JSON.parse(FileManager.readFileSyncAppData(settingsPaths.local).toString())
  : {}

class SettingsHandler {
  /**
   * @param {import('../API/SettingsTypes').Hidden.SettingsId |
   * import('../API/SettingsTypes').Modifiable.SettingsId} id
   * @param {boolean} modifiable Specify if hidden or modifiable setting
   * @returns {*}
   */
  static getSettingsObject (id, modifiable = false) {
    // 1) Check if the ID is in the default list
    if (!this.checkIfIdIsAllowed(id, modifiable)) {
      throw Error(`The id "${id}" is not allowed`)
    }
    // 2) Check if there is a local value of the ID
    const localValue = this.getLocalValue(id, modifiable)
    if (localValue !== undefined) { return localValue }
    // 3) If not existing get the default value
    const defaultValue = this.getDefaultValue(id, modifiable)
    return defaultValue
  }
  /**
   * Get the local value of the setting or the default if no local one was found
   * @param {import('../API/SettingsTypes').Hidden.SettingsId |
   * import('../API/SettingsTypes').Modifiable.SettingsId} id
   * @param {boolean} modifiable Specify if hidden or modifiable setting
   * @returns {import('../API/SettingsTypes').Hidden.SettingsType |
   * import('../API/SettingsTypes').Modifiable.SettingsType | undefined}
   */
  static getLocalValue (id, modifiable = false) {
    if (localSettings.settings !== undefined) {
      const foundElement = modifiable
        ? this.getSettingsObjectByIdHelper(localSettings.settings.modifiable,
          id)
        : this.getSettingsObjectByIdHelper(localSettings.settings.hidden, id)
      return foundElement !== undefined ? foundElement.value : undefined
    } else {
      return undefined
    }
  }
  /**
   * Get the local value of the setting or the default if no local one was found
   * @param {{ id: string; }[]} settings
   * @param {string} id
   * @returns {*}
   */
  static getSettingsObjectByIdHelper (settings, id) {
    return settings !== undefined
      ? settings.find(el => el.id === id)
      : undefined
  }
  /**
   * Get the default value of the setting
   * @param {import('../API/SettingsTypes').Hidden.SettingsId |
   * import('../API/SettingsTypes').Modifiable.SettingsId} id
   * @param {boolean} modifiable Specify if hidden or modifiable setting
   * @returns {*}
   */
  static getDefaultValue (id, modifiable = false) {
    const foundElement = modifiable
      ? this.getSettingsObjectByIdHelper(defaultSettings.settings.modifiable,
        id)
      : this.getSettingsObjectByIdHelper(defaultSettings.settings.hidden, id)
    return foundElement !== undefined ? foundElement.valueDefault : undefined
  }
  /**
   * Check if the id is an allowed settings id
   * @param {string} id
   * @param {boolean} modifiable
   */
  static checkIfIdIsAllowed (id, modifiable = false) {
    return (modifiable
      ? this.getSettingsObjectByIdHelper(defaultSettings.settings.modifiable,
        id)
      : this.getSettingsObjectByIdHelper(defaultSettings.settings.hidden, id)
    ) !== undefined
  }
  /**
   * Set hidden or modifiable settings
   * @param {import('../API/SettingsTypes').Hidden.SettingsId |
   * import('../API/SettingsTypes').Modifiable.SettingsId} id
   * @param {import('../API/SettingsTypes').Hidden.SettingsType |
   * import('../API/SettingsTypes').Modifiable.SettingsType} value
   * @param {boolean} modifiable Specify if hidden or modifiable setting
   */
  static setModifiableOrHidden (id, value, modifiable = false) {
    // 1) Check if the ID is in the default list
    if (!this.checkIfIdIsAllowed(id, modifiable)) {
      throw Error(`The id "${id}" is not allowed`)
    }
    // 2) Set a local value
    if (localSettings.settings === undefined) {
      localSettings.settings = modifiable
        ? { modifiable: [{ id, value }] }
        : { hidden: [{ id, value }] }
    } else if (localSettings
      .settings[modifiable ? 'modifiable' : 'hidden'] === undefined) {
      localSettings.settings[modifiable ? 'modifiable' : 'hidden'] = [
        { id, value }
      ]
    } else {
      const settings = localSettings
        .settings[modifiable ? 'modifiable' : 'hidden']
      // Check if there is an old entry for the same id
      const foundIndex = settings.findIndex(a => a.id === id)
      if (foundIndex >= 0) {
        settings[foundIndex].value = value
      } else {
        // nothing was found, add new array entry
        settings.push({ id, value })
      }
    }
    // 3) Save the updated settings
    this.save()
  }
  /**
   * Save the current local settings to a local file
   */
  static save () {
    FileManager.writeFileSyncAppData(settingsPaths.local,
      JSON.stringify(localSettings))
  }
  /**
   * Get the current modifiable settings with the current local value
   * @returns {import('../API/SettingsTypes').Modifiable.SettingsObjectMerged[]}
   */
  static getModifiableSettingsWithCurrentValue () {
    return defaultSettings.settings.modifiable.map(a => ({
      ...a, value: this.getSettingsObject(a.id, true)
    }))
  }
}

module.exports = SettingsHandler
