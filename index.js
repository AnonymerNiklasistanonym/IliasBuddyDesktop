/**
 * Renderer/main-window script of the electron application
 *
 * @summary Handles the user interactions
 * @author AnonymerNiklasistanyonym
 */

/* =====  TODO  ====== */

// TODO react to wrong login and open Welcome page with input for all credentials
// TODO App info/settings manager
// TODO Rss feed manager (bg checker with notifications)

/* =====  Imports  ====== */

// npm modules
const { ipcRenderer, remote, shell } = require('electron')
const path = require('path')
const cronstrue = require('cronstrue')
const nodeCron = require('node-cron')

// custom modules
const TitleBarWin10 = require('./modules/TitleBarWin10/API/TitleBarWin10')
const WindowManager = require('./modules/WindowManager/API/WindowManager')
const Dialogs = require('./modules/Dialogs/API/Dialogs')
const CronJobHelper = require('./modules/CronJobHelper/API/CronJobHelper')

/* =====  Global variables  ====== */

/**
 * Indicate if info button was toggled
 */
let infoToggled = false
/**
 * Indicate if settings button was toggled
 */
let settingsToggled = false

/* =====  Global constants  ====== */

/**
 * The current window to launch remote commands
 */
const mainWindow = remote.getCurrentWindow()

/**
 * Window manager
 */
const windowManager = new WindowManager([
  { documentId: 'main', id: 'main' },
  { documentId: 'info', id: 'info' },
  { documentId: 'welcome', id: 'welcome' },
  { documentId: 'settings', id: 'settings' },
  { documentId: 'saved', id: 'saved' },
  { documentId: 'links', id: 'links' }], 'main')

/**
 * Title bar
 */
const titleBarWin10 = new TitleBarWin10({ actions: [{
  alt: 'settings',
  id: 'title-bar-action-settings',
  svgFiles: [{ fileName: path.join(__dirname, 'images', 'title-bar', 'settings.svg') }],
  callback: () => togglePopupScreen('settings')
}, {
  alt: 'info',
  id: 'title-bar-action-info',
  svgFiles: [{ fileName: path.join(__dirname, 'images', 'title-bar', 'info.svg') }],
  callback: () => togglePopupScreen('info')
}],
defaultCallbacks: {
  minimize: () => { console.info('TitleBarWin10 > action > minimize') },
  maximize: () => { console.info('TitleBarWin10 > action > maximize') },
  restore: () => { console.info('TitleBarWin10 > action > restore') },
  close: () => { console.info('TitleBarWin10 > action > close') }
} })

/* =====  Global functions  ====== */

/**
 * Toggle popup screens
 * @param {string} popUpScreenId
 */
function togglePopupScreen (popUpScreenId) {
  if (popUpScreenId === 'settings') {
    settingsToggled = !settingsToggled
    if (windowManager.getCurrentWindow() === 'settings') {
      if (!settingsToggled) {
        return windowManager.showPreviousWindow()
      }
    } else {
      settingsToggled = true
    }
  } else if (popUpScreenId === 'info') {
    if (windowManager.getCurrentWindow() === 'info') {
      infoToggled = !infoToggled
      if (!infoToggled) {
        return windowManager.showPreviousWindow()
      }
    } else {
      settingsToggled = true
    }
  } else {
    throw Error('WTF')
  }
  windowManager.showWindow(popUpScreenId, { isPopUpWindow: true })
}

/**
 * Add already rendered ilias entries
 * @param {string[]} newEntries Rendered entries
 * @param {boolean} notification Show notification about the new entries
 */
function addRenderedIliasEntries (newEntries, notification = true) {
  // Add the new entries to the list (at the top)
  const list = document.getElementById('ilias-entries')
  newEntries.forEach(newEntry => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = newEntry
    list.insertBefore(wrapper.firstChild, list.firstChild)
  })
  // Show a notification if wanted
  if (notification && newEntries.length > 0) {
    Dialogs.toast('New entries', newEntries.length + ' entries are new', () => {
      mainWindow.show()
      mainWindow.focus()
    })
  }
}

/**
 * Open link in external browser (for now)
 * @param {string} url
 */
function openExternal (url) {
  shell.openExternal(url, undefined, err => {
    if (err) {
      Dialogs.error('Could not open url in external browser', err.message)
    }
  })
}

/**
 * Copy link to clipboard
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
 * @param {string} url
 */
function copyToClipboard (url) {
  navigator.clipboard.writeText(url).then(() => {
    Dialogs.toast('Copying to clipboard successful', url)
  }, err => {
    Dialogs.error('Could not copy url', JSON.stringify(err, null, 4))
  })
}

/**
 * Set settings element
 * @param {string} documentId Settings id
 * @param {import('./modules/Settings/API/SettingsTypes').Modifiable.SettingsTypeName} type Settings type
 * @param {import('./modules/Settings/API/SettingsTypes').Modifiable.SettingsType} value Settings value
 */
function setSettingsElement (documentId, type, value) {
  const element = document.getElementById(documentId)
  switch (type) {
    case 'toggle':
      // @ts-ignore
      element.checked = value
      break
    case 'text':
    case 'password':
    case 'cronJob':
    case 'url':
    // @ts-ignore
      element.value = value
      break
    default:
      throw Error(`The type "${type}" is not valid!`)
  }
  if (type === 'cronJob') {
    document.getElementById(documentId + '-text').value = CronJobHelper.cronJobStringToHumanReadableString(value, { use24HourTimeFormat: true })
  }
}

/**
 * Set settings onclick callback [Boiler plate from settings api RENDERER]
 * @param {import('./types').SettingsResetInfoObject} infoObject Necessary information
 * @param {import('./modules/Settings/API/SettingsTypes').Modifiable.SettingsType} value New settings value
 */
function setSettings (infoObject, value) {
  // Ask the main process to set the setting
  ipcRenderer.send('settings-set', { ...infoObject, value })
}

/**
 * Reset settings onclick callback [Boiler plate from settings api RENDERER]
 * @param {import('./types').SettingsResetInfoObject} infoObject Necessary information
 */
function resetSettings (infoObject) {
  // Ask the main process to send the default value of the setting
  ipcRenderer.send('settings-reset', { ...infoObject })
}

function cronJobToText (documentId, goalId) {
  document.getElementById(goalId).value = CronJobHelper.cronJobStringToHumanReadableString(document.getElementById(documentId).value, { use24HourTimeFormat: true })
}

/* =====  Inter process communication listeners  ====== */

ipcRenderer
  .on('main-process-to-renderer-message', (event, arg) => {
    console.log('Message:', arg)
  })
  .on('new-entries', (event, arg) => {
    addRenderedIliasEntries(arg, true)
  })
  .on('ilias-login-update',
    /**
     * @param {import('./types').IPC.IliasLoginUpdate} arg
     */
    (event, arg) => {
      console.info('ilias-login-update:', arg)
      if (arg.ready) {
        if (!arg.iliasApiState) {
          Dialogs.toast('Ilias login was NOT successful', arg.errorMessage !== undefined ? arg.errorMessage : '')
          const urlElement = document.getElementById('welcome-ilias-api-privateFeedUrl')
          const nameElement = document.getElementById('welcome-ilias-api-privateFeedUserName')
          const passwordElement = document.getElementById('welcome-ilias-api-privateFeedPassword')
          if (arg.url !== undefined) {
            urlElement.value = arg.url.value
            urlElement.placeholder = arg.url.defaultValue
          }
          if (arg.name !== undefined) {
            nameElement.value = arg.name.value
            nameElement.placeholder = arg.name.defaultValue
          }
          if (arg.password !== undefined) {
            passwordElement.value = arg.password.value
            passwordElement.placeholder = arg.password.defaultValue
          }
          windowManager.showWindow('welcome')
          ipcRenderer.send('show-and-focus-window')
        } else {
          Dialogs.toast('Ilias login was successful', '')
          windowManager.showWindow('main')
        }
      } else {
        console.info('API is not yet ready')
      }
    })
  .on('error-dialog',
    /**
     * Display an error
     * @param {{title: string, message: string }} arg
     */
    (event, arg) => {
      console.log(JSON.stringify(arg))
      console.log(arg.title, arg.message)
      Dialogs.error(arg.title, arg.message)
    })
  .on('get-cache-reply', (event, arg) => {
    addRenderedIliasEntries(arg, false)
  })
  .on('cron-job-debug', (event, arg) => {
    console.log('cron-job-debug', arg)
  })
  .on('settings', (event, arg) => {
    const list = document.getElementById('settings_entries')
    arg.map(a => {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = a
      list.appendChild(wrapper.firstChild)
    })
  })
  .on('version', (event, arg) => {
    document.getElementById('app_version').innerText = arg
  })
  .on('name', (event, arg) => {
    document.getElementById('app_name').innerText = arg
  })
  // Update settings value after it was set
  .on('settings-set-answer', /**
     * @param {import('./types').SettingsSetAnswer} arg
     */
    (event, arg) => {
      setSettingsElement(arg.documentId, arg.type, arg.value)
      if (arg.restart) {
        Dialogs.question('To see the changes the app needs to restart. Do you want to restart immediately?', () => {
          ipcRenderer.send('relaunch', { screenId: windowManager.getCurrentWindow() })
        })
      }
    })
  // Update settings value after a reset was requested
  .on('settings-reset-answer', /**
     * @param {import('./types').SettingsResetAnswer} arg
     */
    (event, arg) => {
      setSettingsElement(arg.documentId, arg.type, arg.defaultValue)
    })
  // Detect new version and ask user if he wants to download and install it
  .on('new-version-detected',
    /**
     * @param {import('./modules/VersionChecker/API/VersionCheckerTypes').GitHubLatestTag} arg
     */
    (event, arg) => {
      Dialogs.question(`Newer version detected (${arg.tag_name}, ${arg.created_at}).\n` +
        'Do you want to download it?', () => {
        openExternal(arg.html_url)
      })
    })
  // Listen to the main process to open windows if the main process wants to
  .on('open-window',
    /**
     * @param {import('./types').OpenWindow} arg
     */
    (event, arg) => {
      windowManager.showWindow(arg.screenId)
    })
  .on('set-native-title-bar', (event, nativeTitleBar) => {
    titleBarWin10.removeTitleBar(document.querySelector('div#title-bar'))
    windowManager.toggleTitleBar(!nativeTitleBar)
    if (!nativeTitleBar) {
      titleBarWin10.addTitleBar(document.querySelector('div#title-bar'))
    }
  })

/* =====  Inter process communication sender  ====== */

// Debug
ipcRenderer.send('render-process-to-main-message', 'Hello from index.js to main.js')

// Check if a login exists
ipcRenderer.send('ilias-login-check')

// Request cached entries
ipcRenderer.send('get-cache')

// Request settings for settings page
ipcRenderer.send('getSettings')

// Request version number and app name for info page
ipcRenderer.send('getVersion')
ipcRenderer.send('getName')

// Check if th Win10 title bar should be displayed
ipcRenderer.send('native-title-bar-check')

/* =====  Setup  ====== */

// Special buttons to reset everything or set all changes
// TODO Implement a "set all" and "reset all" button, hide buttons for now
const saveChangesButton = document.getElementById('saveChanges')
saveChangesButton.style.display = 'none'
const resetEverythingButton = document.getElementById('resetEverything')
resetEverythingButton.style.display = 'none'
const tryToLoginButton = document.getElementById('welcome-ilias-api-submit')
tryToLoginButton.addEventListener('click', () => {
  const url = document.getElementById('welcome-ilias-api-privateFeedUrl').value
  const name = document.getElementById('welcome-ilias-api-privateFeedUserName').value
  const password = document.getElementById('welcome-ilias-api-privateFeedPassword').value
  ipcRenderer.send('test-and-login', { url, name, password })
})

/* =====  Keyboard input listener  ====== */

document.addEventListener('keydown', e => {
  switch (e.which) {
    case 122: // F11 - Fullscreen
      mainWindow.setFullScreen(!mainWindow.isFullScreen())
      windowManager.toggleFullScreen(mainWindow.isFullScreen())
      break
    case 116: // F5 - reload app
      mainWindow.reload()
      break
    case 123: // F12 - open dev tools
      mainWindow.webContents.isDevToolsOpened() ? mainWindow.webContents.closeDevTools() : mainWindow.webContents.openDevTools()
      break
    case 37: // <-  - Screen switch left
      // TODO
      // windowManager.showLeftWindow()
      break
    case 39: // -> - Screen switch right
      // TODO
      // windowManager.showRightWindow()
      break
  }
})
