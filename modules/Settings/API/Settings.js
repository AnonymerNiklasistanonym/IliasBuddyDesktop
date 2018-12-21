const SettingsHandler = require('../HANDLER/SettingsHandler')
const Renderer = require('../RENDERER/Renderer')

/**
 * Class that handles setting/getting settings and can save them to a local file
 */
class Settings {
  /**
   * @param {import('./SettingsTypes').Hidden.SettingsId} id
   * @returns {*}
   */
  static getHidden (id) {
    return SettingsHandler.getSettingsObject(id, false)
  }
  /**
   * @param {import('./SettingsTypes').Modifiable.SettingsId} id
   * @returns {*}
   */
  static getModifiable (id) {
    return SettingsHandler.getSettingsObject(id, true)
  }
  /**
   * @param {import('./SettingsTypes').Modifiable.SettingsId} id
   * @returns {*}
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
   * @returns {import('./SettingsTypes').Modifiable.SettingsObjectMerged[]}
   */
  static getModifiableSettings () {
    return SettingsHandler.getModifiableSettingsWithCurrentValue()
      .map(Renderer.render.bind(Renderer))
  }
  /**
   * Save settings in local file
   */
  static save () {
    SettingsHandler.save()
  }
}

module.exports = Settings
