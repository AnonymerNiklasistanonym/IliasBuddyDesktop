const Dialog = require('dialogs')
const notifier = require('node-notifier')
const path = require('path')

// @ts-ignore
const dialogs = new Dialog()

class Dialogs {
  /**
   * Dialog with OK and CANCEL button
   * @param {String} message - Message of the dialog
   * @param {Function} okCallback - Function that will be executed on OK press
   * @param {Function} cancelCallback - Function that will be executed on CANCEL press
   */
  static question (message, okCallback = () => {}, cancelCallback = () => {}) {
    dialogs.confirm(message, okWasPressed => {
      okWasPressed ? okCallback() : cancelCallback()
    })
  }

  /**
   * Notification with click and timeout listener
   * @param {String} title - Title text
   * @param {String} message - Message text
   * @param {Function} clickCallback - Function that will be executed on click
   * @param {Function} timeoutCallback - Function that will be executed on timeout
   */
  static toast (title, message, clickCallback, timeoutCallback = () => {}) {
    notifier.notify({
      title: title,
      message: message,
      icon: path.join(__dirname, 'images', 'favicon', 'favicon.png'),
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
