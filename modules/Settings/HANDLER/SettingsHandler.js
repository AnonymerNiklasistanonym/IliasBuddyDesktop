
const FileManager = require('../../FileManager/API/FileManager')
const fs = require('fs')
const path = require('path')

const defaultSettingsPath = path.join(__dirname, '../../../settings_new.json')
const localSettingsPath = path.join('settings.json')

// Onload
// 0) Default settings
/**
 * @type {import('./SettingsHandlerTypes').DefaultSettingsJson}
 */
const defaultSettings = JSON.parse(fs.readFileSync(defaultSettingsPath).toString())
// 1) Check if a local settings file is existing
const localSettingsExist = FileManager.fileExistsSyncAppData(localSettingsPath)
// 2) If yes load them, else do nothing
/**
 * @type {import('./SettingsHandlerTypes').LocalSettingsJson}
 */
const localSettings = localSettingsExist ? JSON.parse(FileManager.readFileSyncAppData(localSettingsPath).toString()) : {}

console.log('localSettings', JSON.stringify(localSettings))

class SettingsHandler {
  /**
     * @param {string} id
     * @returns {*}
     */
  static getModifiableOrHidden (id, modifiable = false) {
    // 1) Check if the ID is in the default list
    if (!this.checkIfIdIsAllowed(id, modifiable)) {
      throw Error(`The id "${id}" is not allowed`)
    }
    // 2) Check if there is a local value of the ID
    const localValue = this.getLocalValue(id, modifiable)
    console.log('SettingsHandler.getModifiableOrHidden(' + id + ').localValue:', localValue)
    if (localValue !== undefined) { return localValue }
    // 3) If not existing get the default value
    const defaultValue = this.getDefaultValue(id, modifiable)
    console.log('SettingsHandler.getModifiableOrHidden(' + id + ').defaultValue:', defaultValue)
    return defaultValue
  }
  static getLocalValue (id, modifiable = false) {
    if (localSettings.settings !== undefined) {
      const settings = modifiable ? localSettings.settings.modifiable : localSettings.settings.hidden
      if (settings !== undefined) {
        // if not undefined check if a value was found
        console.log('Local settings not undefined')
        const foundElement = settings.find(el => el.id === id)
        if (foundElement !== undefined) {
          console.log('Local settings object was found!')
          return foundElement.value
        }
      }
    }
  }
  static getDefaultValue (id, modifiable = false) {
    const settings = modifiable ? defaultSettings.settings.modifiable
      : defaultSettings.settings.hidden
    const foundElement = settings.find(el => el.id === id)
    console.log('getDefaultValue(' + id + '):', foundElement)
    if (foundElement !== undefined) {
      return foundElement.valueDefault
    }
  }
  static checkIfIdIsAllowed (id, modifiable = false) {
    const settings = modifiable ? defaultSettings.settings.modifiable
      : defaultSettings.settings.hidden
    return settings.find(a => a.id === id) !== undefined
  }
  /**
     * @param {string} id
     * @param {*} value
     * @returns {*}
     */
  static setModifiableOrHidden (id, value, modifiable = false) {
    // 1) Check if the ID is in the default list
    if (!this.checkIfIdIsAllowed(id, modifiable)) {
      throw Error(`The id "${id}" is not allowed`)
    }
    // 2) Set a local value
    if (localSettings.settings === undefined) {
      localSettings.settings = modifiable ? { modifiable: [{ id, value }] }
        : { hidden: [{ id, value }] }
    } else if (localSettings.settings[modifiable ? 'modifiable' : 'hidden'] === undefined) {
      localSettings.settings[modifiable ? 'modifiable' : 'hidden'] = [{ id, value }]
    } else {
      const settings = localSettings.settings[modifiable ? 'modifiable' : 'hidden']
      // Check if there is an old entry for the same id
      const foundIndex = settings.findIndex(a => a.id === id)
      if (foundIndex >= 0) {
        settings[foundIndex].value = value
      } else {
        // nothing was found, add new array entry
        settings.push({ id, value })
      }
    }
    console.log(`Set hidden settings entry "${id}"=${JSON.stringify(value)}`)
    // 3) Save the updated settings
    this.save()
  }
  static save () {
    console.log('Save')
    FileManager.writeFileSyncAppData(localSettingsPath, JSON.stringify(localSettings))
  }
  static getModifiableSettings () {
    return defaultSettings.settings.modifiable
  }
}

module.exports = SettingsHandler
