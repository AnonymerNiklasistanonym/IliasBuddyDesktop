/* =====  Imports  ====== */

// npm modules
const notifier = require('node-notifier')
const path = require('path')
const { dialog } = require('electron').remote

/* =====  Content  ====== */

/**
 * GUI Dialog helping class
 */
class Dialogs {
  /**
   * Dialog of an error
   * @param {string} title Title of the dialog
   * @param {string} message Error message
   */
  static error (title, message) { dialog.showErrorBox(title, message) }
  /**
   * Dialog with OK and CANCEL button
   * @param {String} title Title of the dialog
   * @param {String} message Question message
   * @param {Function} okCallback Function that will be executed on OK
   * @param {Function} cancelCallback Function that will be executed on CANCEL
   * press
   */
  static question (title, message, okCallback, cancelCallback) {
    dialog.showMessageBox({ buttons: ['OK', 'CANCEL'], message, title },
      okWasPressed => {
        if (okWasPressed === 0) {
          if (okCallback !== undefined) { okCallback() }
        } else {
          if (cancelCallback !== undefined) { cancelCallback() }
        }
      })
  }
  /**
   * Notification with click and timeout listener
   * @param {String} title Title of the toast
   * @param {String} message Message of the toast
   * @param {Function} [clickCallback] Function that will be executed on click
   * @param {Function} [timeoutCallback] Function that will be executed on
   * timeout
   */
  static toast (title, message, clickCallback, timeoutCallback) {
    notifier.notify({
      icon: path.join(__dirname, '../../../images/favicon/favicon.ico'),
      message,
      sound: true,
      title,
      wait: true
    }, (err, response) => {
      if (err) { throw err }
      if (response === 'the toast has timed out') {
        if (timeoutCallback !== undefined) { timeoutCallback() }
      } else {
        if (clickCallback !== undefined) { clickCallback() }
      }
    })
  }
}

/* =====  Exports  ====== */

module.exports = Dialogs
