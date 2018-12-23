const cronstrue = require('cronstrue')
const nodeCron = require('node-cron')

class CronJobHelper {
  /**
   * Check if a cron job string is valid
   * @param {string} cronJobString
   * @returns {boolean}
   */
  static cronJobStringIsValid (cronJobString) {
    return nodeCron.validate(cronJobString)
  }
  /**
   * Get a human readable explanation string  of a cron job string
   * @param {string} cronJobString
   * @param {{use24HourTimeFormat?: boolean}} [options]
   * @returns {string}
   */
  static cronJobStringToHumanReadableString (cronJobString, options) {
    if (this.cronJobStringIsValid(cronJobString)) {
      return cronstrue.toString(cronJobString, {
        use24HourTimeFormat: options !== undefined && options.use24HourTimeFormat
      })
    } else {
      return 'Cron job string is not valid'
    }
  }
}

module.exports = CronJobHelper
