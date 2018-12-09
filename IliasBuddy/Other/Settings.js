// TODO Implement File save and load to save window postion, credentials, etc.

const fs = require('fs')
const path = require('path')

const settingsFilePathDefault = path.join(__dirname, '..', '..', 'settings_default.json')
const settingsFilePath = path.join(__dirname, '..', '..', 'settings.json')

const settingsFileExists = fs.existsSync(settingsFilePath)
/**
 * @type {import('./SettingsTypes').SettingsJson}
 */
const settings = JSON.parse(fs.readFileSync(settingsFileExists ? settingsFilePath : settingsFilePathDefault).toString())

class Settings {
  /**
   * @param {string} name
   * @returns {*}
   */
  static get (name) {
    switch (name) {
      case 'windowBounds':
        return settings.windowBounds
      case 'frame':
        return settings.frame
    }
  }
  static set (name, value) {
    switch (name) {
      case 'windowBounds':
        settings.windowBounds = value
    }
  }
  static save () {
    console.log('Save')
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 4))
  }
}

module.exports = Settings
