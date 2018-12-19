const SettingsHandler = require('../HANDLER/SettingsHandler')
const Renderer = require('../RENDERER/Renderer')

class Settings {
  /**
   * @param {string} id
   * @returns {*}
   */
  static getHidden (id) {
    return SettingsHandler.getModifiableOrHidden(id, false)
  }
  /**
   * @param {string} id
   * @returns {*}
   */
  static getModifiable (id) {
    return SettingsHandler.getModifiableOrHidden(id, true)
  }
  /**
   * Set hidden setting with id and value
   * @param {string} id
   * @param {*} value
   */
  static setHidden (id, value) {
    SettingsHandler.setModifiableOrHidden(id, value, false)
  }
  /**
   * Set modifiable setting with id and value
   * @param {string} id
   * @param {*} value
   */
  static setModifiable (id, value) {
    SettingsHandler.setModifiableOrHidden(id, value, true)
  }
  static getModifiableSettings () {
    return SettingsHandler.getModifiableSettingsWithCurrentValue()
      .map(Renderer.render.bind(Renderer))
  }
  static save () {
    SettingsHandler.save()
  }
}

module.exports = Settings
