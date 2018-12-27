const notifier = require('node-notifier')
const path = require('path')
const { dialog } = require('electron').remote

/**
 * GUI Dialog helping class
 */
class Dialogs {
  /**
   * Display an error box
   * @param {string} message
   * @param {string} err
   */
  static error (message, err) {
    dialog.showErrorBox(message, err)
  }
  /**
   * Dialog with OK and CANCEL button
   * @param {String} message - Message of the dialog
   * @param {Function} okCallback - Function that will be executed on OK press
   * @param {Function} cancelCallback - Function that will be executed on CANCEL
   * press
   */
  static question (message, okCallback, cancelCallback) {
    dialog.showMessageBox(
      { buttons: ['OK', 'CANCEL'], message, title: 'Confirm' },
      okWasPressed => {
        if (okWasPressed === 0) {
          if (okCallback !== undefined) {
            okCallback()
          }
        } else {
          if (cancelCallback !== undefined) {
            cancelCallback()
          }
        }
      })
  }

  /**
   * Notification with click and timeout listener
   * @param {String} title Title text
   * @param {String} message Message text
   * @param {Function} [clickCallback] Function that will be executed on click
   * @param {Function} [timeoutCallback] Function that will be executed on
   * timeout
   */
  static toast (title, message, clickCallback, timeoutCallback) {
    notifier.notify({
      icon: path.join(__dirname, '../../images/favicon/favicon.ico'),
      message: message,
      sound: true,
      title: title,
      wait: true
    },
    (err, response) => {
      if (err) { return console.error(err) }
      if (response === 'the toast has timed out') {
        if (timeoutCallback !== undefined) {
          timeoutCallback()
        }
      } else {
        if (clickCallback !== undefined) {
          clickCallback()
        }
      }
    })
  }
}

module.exports = Dialogs
