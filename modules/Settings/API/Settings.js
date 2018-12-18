const SettingsHandler = require('../HANDLER/SettingsHandler')

class Settings {
  /**
   * @param {string} id
   * @returns {*}
   */
  static getHidden (id) {
    console.log('Settings.getHidden(' + id + ')')
    return SettingsHandler.getModifiableOrHidden(id, false)
  }
  /**
   * @param {string} id
   * @returns {*}
   */
  static getModifiable (id) {
    console.log('Settings.getModifiable(' + id + ')')
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
    return SettingsHandler.getModifiableSettings()
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
    SettingsHandler.save()
  }
}

module.exports = Settings
