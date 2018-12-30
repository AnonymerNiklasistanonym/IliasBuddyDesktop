const SettingsHandler = require('../HANDLER/SettingsHandler')
const Renderer = require('../RENDERER/Renderer')

/**
 * Class that handles setting/getting settings and can save them to a local file
 */
class Settings {
  /**
   * Get value of a hidden setting
   * @param {import('./SettingsTypes').Hidden.SettingsId} id Unique id
   * @returns {*} The value
   */
  static getHidden (id) {
    return SettingsHandler.getValue(id, false)
  }
  /**
   * Get value of a modifiable setting
   * @param {import('./SettingsTypes').Modifiable.SettingsId} id Unique id
   * @returns {*} The value
   */
  static getModifiable (id) {
    return SettingsHandler.getValue(id, true)
  }
  /**
   * Get the default value of a modifiable setting
   * @param {import('./SettingsTypes').Modifiable.SettingsId} id Unique id
   * @returns {*} The default value
   */
  static getModifiableDefault (id) {
    return SettingsHandler.getDefaultValue(id, true)
  }
  /**
   * Set hidden setting with id and value
   * @param {import('./SettingsTypes').Hidden.SettingsId} id
   * @param {import('./SettingsTypes').Hidden.SettingsType} value
   */
  static setHidden (id, value) {
    SettingsHandler.setModifiableOrHidden(id, value, false)
  }
  /**
   * Set modifiable setting with id and value
   * @param {import('./SettingsTypes').Modifiable.SettingsId} id
   * @param {import('./SettingsTypes').Modifiable.SettingsType} value
   */
  static setModifiable (id, value) {
    SettingsHandler.setModifiableOrHidden(id, value, true)
  }
  /**
   * Get all modifiable settings merged with the local values
   * @returns {string[]}
   */
  static getModifiableSettings () {
    return SettingsHandler.getModifiableSettingsWithCurrentValue()
      .map(Renderer.render.bind(Renderer))
  }
  /**
   * Get all modifiable settings merged with the local values
   * @param {string} settingId
   * @returns {import('./SettingsTypes').Modifiable.SettingsObjectMerged}
   */
  static getModifiableSetting (settingId) {
    const settingsObject = SettingsHandler
      .getModifiableSettingsWithCurrentValue()
      .find(a => a.id === settingId)
    return settingsObject
  }
  /**
   * Save settings in local file
   */
  static save () {
    SettingsHandler.save()
  }
  /**
   * Type check a setting
   * @param {import('../API/SettingsTypes').Modifiable.SettingsType} value
   * @param {import('../API/SettingsTypes').Modifiable.SettingsTypeName} type
   */
  static makeModifiableTypeChecks (type, value) {
    SettingsHandler.makeModifiableTypeChecks(type, value)
  }
}

module.exports = Settings
