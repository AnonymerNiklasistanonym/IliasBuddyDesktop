const cronstrue = require('cronstrue')
const nodeCron = require('node-cron')

/**
 * Helper for cron job strings.
 * Includes methods to validate or explain cron jobs.
 */
class CronJobHelper {
  /**
   * Check if a cron job string is valid
   * @param {string} cronJobString Cron job string
   * @returns {boolean} Is valid cron expression
   */
  static cronJobStringIsValid (cronJobString) {
    return nodeCron.validate(cronJobString)
  }
  /**
   * Get a human readable explanation string  of a cron job string
   * @param {string} cronJobString Cron job string
   * @param {{use24HourTimeFormat?: boolean}} [options] Further options
   * for parsing
   * @returns {string} Explanation in string form
   */
  static cronJobStringToHumanReadableString (cronJobString, options) {
    if (this.cronJobStringIsValid(cronJobString)) {
      return cronstrue.toString(cronJobString, {
        use24HourTimeFormat: options !== undefined &&
        options.use24HourTimeFormat
      })
    } else {
      return 'Cron job string is not valid'
    }
  }
}

module.exports = CronJobHelper
