const FileManager = require('../../FileManager/API/FileManager')
const fs = require('fs')
const path = require('path')

const defaultSettingsPath = path.join(__dirname, '../../../settings_new.json')
const localSettingsPath = path.join('settings.json')

// Onload
// 0) Default settings
/**
 * @type {import('./SettingsTypes').DefaultSettingsJson}
 */
const defaultSettings = JSON.parse(fs.readFileSync(defaultSettingsPath).toString())
// 1) Check if a local settings file is existing
const localSettingsExist = FileManager.fileExistsSyncAppData(localSettingsPath)
// 2) If yes load them, else do nothing
/**
 * @type {import('./SettingsTypes').LocalSettingsJson}
 */
const localSettings = localSettingsExist ? JSON.parse(FileManager.readFileSyncAppData(localSettingsPath).toString()) : {}

console.log('localSettings', JSON.stringify(localSettings))

class Settings {
  /**
   * @param {string} id
   * @returns {*}
   */
  static getHidden (id) {
    // 1) Check if the ID is in the default list
    if (!this.checkIfIdIsAllowedHidden(id)) {
      throw Error(`The id "${id}" is not allowed`)
    }
    // 2) Check if there is a local value of the ID
    const localValue = this.getLocalValueHidden(id)
    if (localValue !== undefined) {
      return localValue
    }
    // 3) If not existing get the default value
    return this.getDefaultValueHidden(id)
  }
  static getLocalValueHidden (id) {
    if (localSettings.settings !== undefined && localSettings.settings.hidden !== undefined) {
    // if not undefined check if a value was found
      console.log('Local settings not undefined')
      const foundHiddenElement = localSettings.settings.hidden.find(el => el.id === id)
      if (foundHiddenElement !== undefined) {
        console.log('Local settings object was found!')
        return foundHiddenElement.value
      }
    }
  }
  static getDefaultValueHidden (id) {
    const foundHiddenElement = defaultSettings.settings.hidden.find(el => el.id === id)
    if (foundHiddenElement !== undefined) {
      return foundHiddenElement.valueDefault
    } else {
      throw Error(`This should not happen`)
    }
  }
  static checkIfIdIsAllowedHidden (id) {
    return defaultSettings.settings.hidden.find(a => a.id === id) !== undefined
  }
  static checkIfIdIsAllowedModifiable (id) {
    return defaultSettings.settings.modifiable.find(a => a.id === id) !== undefined
  }
  /**
   * @param {string} id
   * @param {*} value
   * @returns {*}
   */
  static setHidden (id, value) {
    // 1) Check if the ID is in the default list
    if (!this.checkIfIdIsAllowedHidden(id)) {
      throw Error(`The id "${id}" is not allowed`)
    }
    // 2) Set a local value
    if (localSettings.settings === undefined) {
      localSettings.settings = { hidden: [{ id, value }] }
    } else if (localSettings.settings.hidden === undefined) {
      localSettings.settings.hidden = [{ id, value }]
    } else {
      // Check if there is an old entry for the same id
      const foundIndex = localSettings.settings.hidden.findIndex(a => a.id === id)
      if (foundIndex >= 0) {
        localSettings.settings.hidden[foundIndex].value = value
      } else {
        // nothing was found, add new array entry
        localSettings.settings.hidden.push({ id, value })
      }
    }
    console.log(`Set hidden settings entry "${id}"=${JSON.stringify(value)}`)
    // 3) Save the updated settings
    this.save()
  }
  static getModifiableSettings () {
    return defaultSettings.settings.modifiable
  }
  static renderSettings (settingsObject) {
    return settingsObject.map(temp => {
      const container = document.createElement('li')
      container.id = temp.id
      const name = document.createElement('p')
      name.innerText = temp.info.name
      const description = document.createElement('p')
      description.innerText = temp.info.description
      const value = document.createElement('p')
      value.innerText = temp.type
      container.appendChild(name)
      container.appendChild(description)
      container.appendChild(value)

      return container
    })
  }
  static save () {
    console.log('Save')
    FileManager.writeFileSyncAppData(localSettingsPath, JSON.stringify(localSettings))
  }
}

module.exports = Settings
