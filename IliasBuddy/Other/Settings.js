// TODO Implement File save and load to save window postion, credentials, etc.

class Settings {
  /**
   * @param {string} name
   * @returns {*}
   */
  static get (name) {
    switch (name) {
      case 'windowBounds':
        return { width: 720, height: 300, x: 0, y: 0 }
      case 'frame':
        return false
    }
  }
  static set (name, value) {
    switch (name) {
      case 'windowBounds':
        console.log(value)
    }
  }
  static save () {
    console.log('Save')
  }
}

module.exports = Settings
