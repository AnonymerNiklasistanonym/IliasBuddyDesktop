// Wrap everything in another bracket to use the same variable names
{
  const { ipcRenderer } = require('electron')

  /**
   * Send to main process changes of the network state
   * (online=true/offline=false)
   */
  const updateOnlineStatus = () => {
    console.info('New online state: online=' + navigator.onLine)
    ipcRenderer.send('online-status-changed', navigator.onLine)
  }

  // Listen to the browser for online/offline changes
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  updateOnlineStatus()
}
