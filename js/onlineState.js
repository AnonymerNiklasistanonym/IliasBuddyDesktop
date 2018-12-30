/**
 * Script of the electron application to detect online state changes via the DOM
 *
 * @summary Handles online state detection
 * @author AnonymerNiklasistanyonym
 */

// Wrap everything in brackets to reuse variable names in other scripts
{
  /* =====  Imports  ====== */

  // npm modules
  const { ipcRenderer } = require('electron')
  const log = require('electron-log')

  /* =====  Logging  ====== */

  log.debugOnlineState = parameter =>
    log.debug('[debugOnlineState] ' + parameter)

  /* =====  Global constants  ====== */

  /**
   * Send to main process changes of the network state
   * (online=true/offline=false)
   */
  const updateOnlineStatus = () => {
    log.debugOnlineState(`New online state: online=${navigator.onLine}`)
    ipcRenderer.send('online-status-changed', navigator.onLine)
  }

  /* =====  Content  ====== */

  // Listen to the browser for online/offline changes with a callback to send
  // any changes to the main process
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  // Also - just to be sure - run the callback initially once
  updateOnlineStatus()
}
