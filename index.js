/**
 * Renderer/main-window script of the electron application
 *
 * @summary Handles the user interactions
 * @author AnonymerNiklasistanyonym
 */

/* =====  Imports  ====== */

// npm modules
const { ipcRenderer, remote, shell } = require('electron')
const path = require('path')
const log = require('electron-log')
const moment = require('moment')
// custom modules
const TitleBarWin10 = require('./modules/TitleBarWin10/API/TitleBarWin10')
const WindowManager = require('./modules/WindowManager/API/WindowManager')
const Dialogs = require('./modules/Dialogs/API/Dialogs')
const CronJobHelper = require('./modules/CronJobHelper/API/CronJobHelper')

/* =====  Logging  ====== */

log.debugIndex = parameter => log.debug('[index] ' + parameter)

/* =====  Global variables  ====== */

/**
 * Indicate if info button was toggled
 */
let gInfoPopupToggled = false
/**
 * Indicate if settings button was toggled
 */
let gSettingsPopupToggled = false

/* =====  Global constants  ====== */

/**
 * The current window to launch remote commands
 */
const gMainWindow = remote.getCurrentWindow()

/**
 * Window manager
 */
const gWindowManager = new WindowManager([
  { documentId: 'main', id: 'main' },
  { documentId: 'info', id: 'info' },
  { documentId: 'welcome', id: 'welcome' },
  { documentId: 'settings', id: 'settings' },
  { documentId: 'saved', id: 'saved' },
  { documentId: 'links', id: 'links' }], 'main')

/**
 * Title bar
 */
const gTitleBar = new TitleBarWin10({
  actions: [{
    alt: 'settings',
    id: 'title-bar-action-settings',
    onClickCallback: () => { togglePopupScreen('settings') },
    svgFiles: [{
      fileName: path.join(__dirname, 'images', 'title-bar', 'settings.svg')
    }]
  }, {
    alt: 'info',
    id: 'title-bar-action-info',
    onClickCallback: () => { togglePopupScreen('info') },
    svgFiles: [{
      fileName: path.join(__dirname, 'images', 'title-bar', 'info.svg')
    }]
  }],
  appIconPath: path.join(__dirname, './images/favicon/favicon.svg'),
  appName: 'IliasBuddyDesktop',
  defaultCallbacks: {
    close: () => {
      log.debugIndex('TitleBarWin10 > action > close')
      return Promise.resolve()
    },
    maximize: () => {
      log.debugIndex('TitleBarWin10 > action > maximize')
      return Promise.resolve()
    },
    minimize: () => {
      log.debugIndex('TitleBarWin10 > action > minimize')
      return Promise.resolve()
    },
    restore: () => {
      log.debugIndex('TitleBarWin10 > action > restore')
      return Promise.resolve()
    }
  },
  menu: [{
    onClickCallback: () => { gWindowManager.showWindow('main') },
    text: 'Feed'
  }, {
    onClickCallback: () => { gWindowManager.showWindow('saved') },
    text: 'Saved'
  }, {
    onClickCallback: () => { gWindowManager.showWindow('links') },
    text: 'Links'
  }]
})

/* =====  Global functions  ====== */

/**
 * Toggle popup screens
 * @param {string} popUpScreenId Popup screen id
 */
function togglePopupScreen (popUpScreenId) {
  log.debugIndex(`togglePopupScreens (popUpScreenId=${popUpScreenId})`)
  // If the popup window is the settings screen
  if (popUpScreenId === 'settings') {
    // And the current screen is not this screen
    if (gWindowManager.getCurrentWindow() !== popUpScreenId) {
      // Just set settings toggled true
      gSettingsPopupToggled = true
    } else {
      // Else toggle settings toggled and show the previous window
      gSettingsPopupToggled = !gSettingsPopupToggled
      if (!gSettingsPopupToggled) { return gWindowManager.showPreviousWindow() }
    }
  } else if (popUpScreenId === 'info') {
    // Do the same with 'info'
    if (gWindowManager.getCurrentWindow() !== popUpScreenId) {
      // Just set info toggled true
      gInfoPopupToggled = true
    } else {
      // Else toggle info toggled and show the previous window
      gInfoPopupToggled = !gInfoPopupToggled
      if (!gInfoPopupToggled) { return gWindowManager.showPreviousWindow() }
    }
  } else {
    throw Error(`This popup window id is not supported: "${popUpScreenId}"`)
  }
  // If not a previous window was shown show now the popup window
  gWindowManager.showWindow(popUpScreenId, { isPopUpWindow: true })
}

/**
 * Add already rendered ilias entries to entries list (at the top)
 * @param {string[]} newEntries Rendered Ilias entries
 * @param {boolean} notification Show notification about the new entries
 */
function addRenderedIliasEntries (newEntries, notification = true) {
  // First get the list that contains all entries
  const list = document.getElementById('ilias-entries')
  // For each new entry add the rendered entry at the top
  newEntries.forEach(newEntry => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = newEntry
    list.insertBefore(wrapper.firstChild, list.firstChild)
  })
  // Show a notification if wanted and there are new elements
  if (notification && Array.isArray(newEntries) && newEntries.length > 0) {
    Dialogs.toast('New Ilias entries',
      newEntries.length + ' entries are new', () => {
        ipcRenderer.send('show-and-focus-window')
      })
  }
}

/**
 * Open a link in external browser
 * @param {string} url The website URL that should be opened
 * @returns {Promise<void>}
 */
function openExternal (url) {
  return new Promise((resolve, reject) =>
    shell.openExternal(url, undefined, err => { err ? reject(err) : resolve() })
  )
}

/**
 * Copy link to clipboard
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
 * @param {string} url Url which should be copied to the clipboard
 */
function copyToClipboard (url) {
  navigator.clipboard.writeText(url)
    .then(() => { Dialogs.toast('Copying to clipboard successful', url) },
      err => { Dialogs.error('Could not copy url', err.message) })
}

/**
 * Set settings element
 * @param {string} documentId Settings id
 * @param {import('./modules/Settings/API/SettingsTypes')
 * .Modifiable.SettingsTypeName} type Settings type
 * @param {import('./modules/Settings/API/SettingsTypes')
 * .Modifiable.SettingsType} value Settings value
 */
const setSettingsElement = (documentId, type, value) => {
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
    case 'keyboardShortcut':
    // @ts-ignore
      element.value = value
      break
    default:
      throw Error(`The type "${type}" is not valid!`)
  }
  if (type === 'cronJob') {
    document.getElementById(documentId + '-text').value = CronJobHelper
      .cronJobStringToHumanReadableString(value, { use24HourTimeFormat: true })
  }
}

// TODO
/**
 * TODO
 * Save entry (change later link to guid or let it be)
 * @param {string} link
 */
function save (link) {
  log.debugIndex('FUTURE > Save entry: ' + link)
}

/**
 * Set settings onclick callback [Boiler plate from settings api RENDERER]
 * @param {import('./mainTypes').SettingsResetQuestion} infoObject Necessary
 * information
 * @param {import('./modules/Settings/API/SettingsTypes')
 * .Modifiable.SettingsType} value New settings value
 */
function setSettings (infoObject, value) {
  // Ask the main process to set the setting
  // FIXME
  // TODO Determine with switch case and infoObject.documentId the current value
  // to remove inline JS
  ipcRenderer.send('settings-set', { ...infoObject, value })
}

/**
 * Reset settings onclick callback [Boiler plate from settings api RENDERER]
 * @param {import('./mainTypes').SettingsResetQuestion} infoObject Necessary
 * information
 */
function resetSettings (infoObject) {
  // Ask the main process to send the default value of the setting
  ipcRenderer.send('settings-reset', { ...infoObject })
}

/**
 * Get cron job string from one HTML element by id and copy an explanation
 * string into another HTML element by "goal" id
 * [Boiler plate from settings api RENDERER]
 * @param {string} documentId HTML element id which contains the cron job string
 * @param {string} goalDocumentIdId HTML element id which should get the
 * explanation string
 */
function cronJobToText (documentId, goalDocumentIdId) {
  document.getElementById(goalDocumentIdId).value = CronJobHelper
    .cronJobStringToHumanReadableString(
      document.getElementById(documentId).value, { use24HourTimeFormat: true })
}

const runThemNeverOnlyCallbacks = false
if (runThemNeverOnlyCallbacks) {
  resetSettings(undefined)
  setSettings(undefined)
  copyToClipboard(undefined)
  cronJobToText(undefined, undefined)
}

/* =====  Inter process communication listeners  ====== */

ipcRenderer
  .on('main-process-to-renderer-message', (event, message) => {
    log.debugIndex(`Message: ${message}`)
  })
  .on('new-entries', (event, arg) => {
    log.debugIndex(`New entries incoming (${arg.length})`)
    addRenderedIliasEntries(arg, true)
  })
  .on('ilias-login-update',
    /**
     * @param {import('./mainTypes').IPC.IliasLoginUpdate} arg
     */
    // tslint:disable-next-line: cyclomatic-complexity
    (event, arg) => {
      if (arg.ready) {
        if (!arg.iliasApiState) {
          if (arg.errorMessage === undefined) {
            throw Error('Error message is missing!')
          }
          if (arg.url === undefined || arg.name === undefined ||
              arg.password === undefined) {
            throw Error('URL/Name/Default password need all to defined!')
          }
          Dialogs.toast('Ilias login was NOT successful',
            arg.errorMessage !== undefined ? arg.errorMessage : '')
          const urlElement = document
            .getElementById('welcome-ilias-api-privateFeedUrl')
          const nameElement = document
            .getElementById('welcome-ilias-api-privateFeedUserName')
          const passwordElement = document
            .getElementById('welcome-ilias-api-privateFeedPassword')
          if (arg.url !== undefined) {
            urlElement.value = arg.url.value
            urlElement.placeholder = arg.url.valueDefault
          }
          if (arg.name !== undefined) {
            nameElement.value = arg.name.value
            nameElement.placeholder = arg.name.valueDefault
          }
          if (arg.password !== undefined) {
            passwordElement.placeholder = arg.password.valueDefault
          }
          passwordElement.value = ''
          gWindowManager.showWindow('welcome')
          ipcRenderer.send('show-and-focus-window')
        } else {
          Dialogs.toast('Ilias login was successful', '')
          gWindowManager.showWindow('main')
          // Get settings again
          ipcRenderer.send('getSettings')
        }
      } else { log.debugIndex('API is not yet ready') }
    })
  .on('error-dialog',
    /**
     * Display an error
     * @param {{title: string, message: string }} arg
     */
    (event, arg) => { Dialogs.error(arg.title, arg.message) })
  .on('get-cache-reply', (event, arg) => {
    addRenderedIliasEntries(arg, false)
  })
  .on('settings', (event, arg) => {
    const list = document.getElementById('settings_entries')
    // Remove all settings entries
    while (list.firstChild) { list.removeChild(list.firstChild) }
    // Add rendered settings entries
    arg.map(a => {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = a
      list.appendChild(wrapper.firstChild)
    })
  })
  .once('version', (event, arg) => {
    document.getElementById('app_version').innerText = arg
  })
  .once('name', (event, arg) => {
    document.getElementById('app_name').innerText = arg
  })
  // Update settings value after it was set
  .on('settings-set-answer',
    /**
     * @param {import('./mainTypes').SettingsSet} arg
     */
    (event, arg) => {
      setSettingsElement(arg.documentId, arg.type, arg.value)
      if (arg.restart) {
        Dialogs.question('Confirm',
          'To see the changes the app needs to restart.' +
          'Do you want to restart immediately?', () => {
            ipcRenderer.send('relaunch',
              { screenId: gWindowManager.getCurrentWindow() })
          })
      }
    })
  // Update settings value after a reset was requested
  .on('settings-reset-answer',
    /**
     * @param {import('./mainTypes').SettingsResetAnswer} arg
     */
    (event, arg) => {
      setSettingsElement(arg.documentId, arg.type, arg.valueDefault)
    })
  // Detect new version and ask user if he wants to download and install it
  .on('new-version-detected',
    /**
     * @param {import('./mainTypes').NewVersionDetected} info
     */
    (event, info) => {
      Dialogs.question('Confirm', 'Newer version detected ' +
        `(${info.newVersion}, ${moment(info.date).fromNow()}).\n` +
        'Do you want to download it?\n\n' + 'Release notes:\n' +
        info.releaseNotes, () => {
        openExternal(info.url).catch(err => Dialogs
          .error('Release website could not be opened', err.message))
      })
    })
  // Listen to the main process to open windows if the main process wants to
  .on('open-window',
    /**
     * @param {import('./mainTypes').OpenWindow} arg
     */
    (event, arg) => {
      if (arg.screenId === 'info' || arg.screenId === 'settings') {
        togglePopupScreen(arg.screenId)
      } else {
        gWindowManager.showWindow(arg.screenId)
      }
    })
  .on('set-native-title-bar', (event, nativeTitleBar) => {
    gTitleBar.removeTitleBar(document.querySelector('div#title-bar'))
    gWindowManager.toggleTitleBar(!nativeTitleBar)
    if (!nativeTitleBar) {
      gTitleBar.addTitleBar(document.querySelector('div#title-bar'))
    }
  })

/* =====  Content  ====== */

// Initially request cached entries
ipcRenderer.send('get-cache')

// Request settings for settings page
ipcRenderer.send('getSettings')

// Request version number and app name for about page
ipcRenderer.send('getVersion')
ipcRenderer.send('getName')

// Check if th Win10 title bar should be displayed
ipcRenderer.send('native-title-bar-check')

// Try to login when the "try to login" button on the welcome page is clicked
document.getElementById('welcome-ilias-api-submit')
  .addEventListener('click', () => {
    ipcRenderer.send('test-and-login', {
      name: document
        .getElementById('welcome-ilias-api-privateFeedUserName').value,
      password: document
        .getElementById('welcome-ilias-api-privateFeedPassword').value,
      url: document
        .getElementById('welcome-ilias-api-privateFeedUrl').value
    })
  })

// Check for a new program version when the "update checker" button on the about
// page is clicked
document.getElementById('check-for-updates')
  .addEventListener('click', () => { ipcRenderer.send('new-version-check') })

// Keyboard input listener
// tslint:disable-next-line: cyclomatic-complexity
document.addEventListener('keydown', e => {
  switch (e.which) {
    case 122: // F11 - Fullscreen
      gMainWindow.setFullScreen(!gMainWindow.isFullScreen())
      gWindowManager.toggleFullScreen(gMainWindow.isFullScreen())
      break
    case 116: // F5 - reload app
      gMainWindow.reload()
      break
    case 123: // F12 - open dev tools
      gMainWindow.webContents.isDevToolsOpened()
        ? gMainWindow.webContents.closeDevTools()
        : gMainWindow.webContents.openDevTools()
      break
    case 37: // <-  - Screen switch left
      switch (gWindowManager.getCurrentWindow()) {
        case 'links':
          gWindowManager.showWindow('saved')
          break
        case 'saved':
          gWindowManager.showWindow('main')
          break
        default:
          // do nothing
      }
      break
    case 39: // -> - Screen switch right
      switch (gWindowManager.getCurrentWindow()) {
        case 'main':
          gWindowManager.showWindow('saved')
          break
        case 'saved':
          gWindowManager.showWindow('links')
          break
        default:
          // do nothing
      }
      break
  }
})
