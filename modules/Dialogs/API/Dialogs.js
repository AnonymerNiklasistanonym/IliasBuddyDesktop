const notifier = require('node-notifier')
const path = require('path')
const dialog = require('electron').remote.dialog

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
   * @param {Function} cancelCallback - Function that will be executed on CANCEL press
   */
  static question (message, okCallback = () => {}, cancelCallback = () => {}) {
    dialog.showMessageBox({
      title: 'IliasBuddy > Confirm',
      message,
      buttons: ['OK', 'CANCEL']
    }, okWasPressed => {
      console.log('Pressed:', okWasPressed)
      okWasPressed === 0 ? okCallback() : cancelCallback()
    })
  }

  /**
   * Notification with click and timeout listener
   * @param {String} title Title text
   * @param {String} message Message text
   * @param {Function} [clickCallback] Function that will be executed on click
   * @param {Function} [timeoutCallback] Function that will be executed on timeout
   */
  static toast (title, message, clickCallback = () => {}, timeoutCallback = () => {}) {
    notifier.notify({
      title: title,
      message: message,
      icon: path.join(__dirname, '../../images/favicon/favicon.ico'),
      sound: true,
      wait: true
    },
    (err, response) => {
      if (err) return console.error(err)
      if (response === 'the toast has timed out') timeoutCallback()
      else clickCallback()
    })
  }
}

module.exports = Dialogs
