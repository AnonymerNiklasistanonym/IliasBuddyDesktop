const fs = require('fs')
const path = require('path')
const electron = require('electron')

const userDataPath = (electron.app || electron.remote.app).getPath('userData')

class FileManager {
  /**
   * Write a file to the "AppData" directory [SYNCHRONOUS]
   * @param {*} filePath
   * @param {*} data
   */
  static writeFileSyncAppData (filePath, data) {
    return fs.writeFileSync(path.join(userDataPath, filePath), data)
  }
  /**
   * Read a file from the "AppData" directory [SYNCHRONOUS]
   * @param {*} filePath
   */
  static readFileSyncAppData (filePath) {
    return fs.readFileSync(path.join(userDataPath, filePath))
  }
  /**
   * Check if a file exists in the "AppData" directory [SYNCHRONOUS]
   * @param {*} filePath
   */
  static fileExistsSyncAppData (filePath) {
    return fs.existsSync(path.join(userDataPath, filePath))
  }
}

module.exports = FileManager
