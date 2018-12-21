/**
 * Main script of the electron application
 *
 * @summary Handles the app start/close, main process, window-creation, api-calls, ...
 * @author AnonymerNiklasistanyonym
 */

/* =====  TODO  ====== */

/* =====  Imports  ====== */

// npm modules
const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, shell, nativeImage } = require('electron')
const path = require('path')
const url = require('url')
const AutoLaunch = require('auto-launch')
const cron = require('node-cron')
// custom modules
const VersionChecker = require('./modules/VersionChecker/API/VersionChecker')
const Settings = require('./modules/Settings/API/Settings')
const IliasBuddyApi = require('./modules/IliasBuddy/API/IliasBuddyApi')

/* =====  Startup checks  ====== */

// Only one instance of the program should run - quit if this is the >= 2nd
if (!app.requestSingleInstanceLock()) app.quit()

/* =====  Global variables  ====== */

/**
 * Global GUI window
 * @type {BrowserWindow}
 */
let gMainWindow = null
/**
 * Global cron job for program updates
 * @type {cron.ScheduledTask}
 */
let gCronJobProgramUpdate = null
/**
 * Global cron job for feed updates
 * @type {cron.ScheduledTask}
 */
let gCronJobFeedUpdate = null
/**
 * Global interface to connect to and use the Ilias RSS feed
 * @type {IliasBuddyApi}
 */
let gIliasApi = null
/**
 * Global indictor if computer is offline/online
 * @type {boolean}
 */
let gOnline = false
/**
 * Global variable to enable/disable auto launch
 * @type {AutoLaunch}
 */
let gAutoLaunch = null

let waitUnitlOneLoginTest = true
let atLeastOneFeedbackOnlineStatus = false

/* =====  Global functions  ====== */

/**
 * Enable/disable the auto launch after settings
 */
function setAutoLaunch () {
  const enableIt = Settings.getModifiable('autoLaunch')
  gAutoLaunch.isEnabled().then(isEnabled => {
    if (enableIt) {
      // If it should be enabled but not on the system enable it
      if (!isEnabled) { gAutoLaunch.enable() }
    } else {
      // If it should be disabled but on the system disable it
      if (isEnabled) { gAutoLaunch.disable() }
    }
  })
}

/**
 * Enable/disable/change the program update cron job after settings
 */
function setCronJobProgramUpdate () {
  if (gCronJobProgramUpdate !== null) {
    gCronJobProgramUpdate.destroy()
  }
  const enableIt = Settings.getModifiable('checkForUpdatesCronJob')
  if (enableIt) {
    const cronJob = Settings.getModifiable('checkForUpdatesCronJobConfiguration')
    gCronJobProgramUpdate = cron.schedule(cronJob, () => {
      checkForUpdates()
      gMainWindow.webContents.send('cron-job-debug', 'cronJobProgramUpdates ' + cronJob)
    })
    gMainWindow.webContents.send('cron-job-debug', 'cronJobProgramUpdates started')
  }
}

/**
 * Enable/disable/change the feed update cron job
 */
function setCronJobFeedUpdate () {
  if (gCronJobFeedUpdate !== null) {
    gCronJobFeedUpdate.destroy()
  }
  const enableIt = Settings.getModifiable('checkForFeedCronJob')
  if (enableIt) {
    const cronJob = Settings.getModifiable('checkForFeedCronJobConfiguration')
    gCronJobFeedUpdate = cron.schedule(cronJob, () => {
      if (gIliasApi !== null) {
        gIliasApi.manageEntries.getCurrentEntries(true).catch(console.error)
      }
      // DEBUG
      gMainWindow.webContents.send('cron-job-debug', 'cronJobFeedUpdates ' + cronJob)
    })
    gMainWindow.webContents.send('cron-job-debug', 'cronJobFeedUpdates started')
  }
}

function loginIliasBuddy () {
  console.log('loginIliasBuddy')
  if (atLeastOneFeedbackOnlineStatus) {
    // Check first if online
    if (!gOnline) {
      console.log('loginToIliasApi', 'if (!gOnline)')
      gMainWindow.webContents.send('error-dialog', { title: 'Ilias login error', message: 'Not online' })

      waitUnitlOneLoginTest = false
    } else {
      console.log('loginToIliasApi', 'if (gOnline)')
      // If online check if the credentials are correct
      checkIliasLogin()
        .then(() => {
          console.log('loginToIliasApi', 'checkIliasLogin().then(')
          loginToIliasApi()
          console.log('loginToIliasApi', 'was successful')
          gMainWindow.webContents.send('ilias-login-update', true)
          // And at last try to fetch the latest entries
          getLatestIliasEntries()

          waitUnitlOneLoginTest = false
        })
        .catch(err => {
          console.log('loginToIliasApi', 'checkIliasLogin().catch(')
          console.log('loginToIliasApi', 'was NOT successful')
          gMainWindow.webContents.send('error-dialog', { title: 'Ilias login error', message: err.message + '' })
          gMainWindow.webContents.send('ilias-login-update', false)

          waitUnitlOneLoginTest = false
        })
    }
  }
}

/**
 * Check if the credentials/internet connection are correct
 * @returns {Promise<boolean>}
 */
function checkIliasLogin (userName = Settings.getModifiable('userName'),
  password = Settings.getModifiable('userPassword'),
  url = Settings.getModifiable('userUrl')) {
  return new Promise((resolve, reject) => {
    console.log(userName, password, url)
    if (userName !== undefined && password !== undefined && url !== undefined) {
      console.log('checkIliasLogin - test connection')
      IliasBuddyApi.testConnection(url, userName, password)
        .then(() => {
          console.log('checkIliasLogin - test connection.then()')
          resolve()
        }).catch(err => {
          console.log('checkIliasLogin - test connection.catch()')
          reject(err)
        })
    } else {
      reject(Error('Not all settings were found setup (' +
        `user name: ${userName !== undefined}, ` +
        `password: ${password !== undefined}, ` +
        `url: ${url !== undefined}` + ')'))
    }
  })
}

function loginToIliasApi () {
  const settingsFeedUserName = Settings.getModifiable('userName')
  const settingsFeedPassword = Settings.getModifiable('userPassword')
  const settingsFeedUrl = Settings.getModifiable('userUrl')
  gIliasApi = new IliasBuddyApi(settingsFeedUrl, settingsFeedUserName, settingsFeedPassword, newEntries => {
    console.log('Main >> New entries >>', newEntries.length)
    if (newEntries !== undefined && newEntries.length > 0) {
      gMainWindow.webContents.send('new-entries', convertIliasEntriesForClient(newEntries))
    }
  })
}

/**
 * Convert Ilias API new entries to rendered HTML strings
 * @param {import("./modules/IliasBuddy/PARSER/RawEntryParserTypes").IliasBuddyRawEntryParser.Entry[]} entries
 * @returns {string[]}
 */
function convertIliasEntriesForClient (entries) {
  return IliasBuddyApi.renderEntriesHtml(entries).reverse()
}

function setupAfterWindowHasLoaded () {
  gMainWindow.webContents.send('main-process-to-renderer-message', 'Hello from main.js to index.js 2')
  console.log('ready-to-show')
  // Try to login to ilias API
  loginIliasBuddy()

  // Create auto launch object
  gAutoLaunch = new AutoLaunch({ name: 'test', isHidden: true })
  // Get if auto launch should be enabled/disabled per setting
  setAutoLaunch()

  // If auto launch is enabled minimize the window on start
  const restartInfo = Settings.getHidden('restartInfo')
  if (restartInfo.openScreen) {
    // Show and focus it
    gMainWindow.show()
    gMainWindow.focus()
    // And send notification to index.js
    gMainWindow.webContents.send('open-window', { screenId: restartInfo.screenId })
    // And overwrite settings object
    Settings.setHidden('restartInfo', { openScreen: false, screenId: 'none' })
  } else {
    if (Settings.getModifiable('autoLaunch')) {
      gMainWindow.minimize()
    } else {
      // Else show and focus it
      gMainWindow.show()
      gMainWindow.focus()
    }
  }

  // If dev mode is activated open dev console
  if (Settings.getModifiable('devMode')) {
    gMainWindow.webContents.openDevTools()
  }

  // If wanted check for program updates on start
  if (Settings.getModifiable('checkForUpdatesOnStartup')) {
    checkForUpdates()
  }

  // Check for feed updates on start
  if (gIliasApi !== null) {
    gIliasApi.manageEntries.getCurrentEntries(true)
      .catch(console.error)
  }

  // Start program update cron job if wanted
  setCronJobProgramUpdate()

  // Start feed update cron job if wanted
  setCronJobFeedUpdate()
}

/**
 * Create the main window
 */
function createWindow () {
  // Get settings that are used more than once
  const settingsWindowBounds = Settings.getHidden('windowBounds')
  const settingsMinWindowBounds = Settings.getHidden('minWindowBounds')
  const settingsNativeTitleBar = Settings.getModifiable('nativeTitleBar')
  const settingsMinimizeToSystemTray = Settings.getModifiable('minimizeToSystemTray')

  // Icon path
  const iconPath = path.join(__dirname, 'images', 'favicon', 'favicon.ico')

  // Create a BrowserWindow object
  gMainWindow = new BrowserWindow({
    frame: settingsNativeTitleBar,
    title: app.getName(),
    titleBarStyle: 'hidden', // macOS: buttons are an overlay
    minWidth: settingsMinWindowBounds.width,
    minHeight: settingsMinWindowBounds.height,
    width: settingsWindowBounds.width,
    height: settingsWindowBounds.height,
    x: settingsWindowBounds.x,
    y: settingsWindowBounds.y,
    show: false, // do not show the window before content is loaded
    icon: iconPath,
    center: settingsWindowBounds.x === 0 && settingsWindowBounds.y === 0,
    // Enable node integration in window
    webPreferences: { nodeIntegration: true }
  })

  // Load the 'index.html' file in the window
  gMainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // TODO Fill with wanted settings and be also able to send to the render process
  // which ones should be enabled in case of the win10 like menubar is used
  if (settingsNativeTitleBar) {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: 'Menu',
        submenu: [
          {
            label: 'Click',
            click () {
              gMainWindow.webContents.send('main-process-to-renderer-message', 'Menu Bar TODO')
            }
          },
          { label: 'submenu1' },
          { label: 'submenu2' }
        ]
      }
    ]))
  }

  // If wanted create system tray
  if (settingsMinimizeToSystemTray) {
    const systemTray = new Tray(nativeImage.createFromPath(iconPath))
    systemTray.setToolTip('IliasBuddy')
    systemTray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show App',
        click: function () {
          if (gMainWindow.isVisible()) {
            gMainWindow.focus()
          } else {
            gMainWindow.show()
          }
        } },
      { label: 'Quit',
        click: function () {
          app.quit()
        } }
    ]))
    systemTray.on('click', () => {
      if (gMainWindow) {
        if (gMainWindow.isVisible()) {
          gMainWindow.focus()
        } else {
          gMainWindow.show()
        }
      }
    })
  }

  gMainWindow.webContents
    // Prevent the browser window from opening websites in it
    .on('will-navigate', (event, url) => {
      event.preventDefault()
      if (url.startsWith('http:') || url.startsWith('https:')) {
        shell.openExternal(url)
      } else {
        dialog.showErrorBox('Error', 'URL is not safe? - ' + url)
      }
    })

  gMainWindow.once('ready-to-show', () => {
    console.log('.once(\'ready-to-show\'')
    setupAfterWindowHasLoaded()
  })

  // window event listener
  gMainWindow
    .on('ready-to-show', () => {
      console.log('.on(\'ready-to-show\'')
      setupAfterWindowHasLoaded()
    })
    .on('close', () => {
      // Save settings before closing
      saveSettings()
      // Disable active cron jobs
      if (gCronJobProgramUpdate !== null) {
        gCronJobProgramUpdate.destroy()
      }
      if (gCronJobFeedUpdate !== null) {
        gCronJobFeedUpdate.destroy()
      }
      // Remove cache and other data that is not used to keep the app clean
      gMainWindow.webContents.session.clearStorageData()
      gMainWindow.webContents.session.clearCache(() => {})
      gMainWindow.webContents.clearHistory()
    })
    .on('closed', () => {
      // Dereference the window object
      gMainWindow = null
    })
    .on('minimize', function (event) {
      // If wanted hide the window to the system tray if minimized
      if (settingsMinimizeToSystemTray) {
        event.preventDefault()
        gMainWindow.hide()
      }
    })

  console.log('Window is ready')
  setupAfterWindowHasLoaded()
}

/**
 * Save current settings (+ window size/position) in preferences file
 */
function saveSettings () {
  if (gIliasApi !== null) {
    gIliasApi.manageEntries.saveCacheFile()
  }
  Settings.setHidden('windowBounds', gMainWindow.getBounds())
}

function checkForUpdates () {
  VersionChecker.getLatestTagGithub(Settings.getHidden('githubLatestReleaseUrl'))
    .then(json => {
      if (json.tag_name !== 'v' + app.getVersion()) {
        console.log('Other version detected')
        gMainWindow.webContents.send('new-version-detected', json)
      }
    })
    .catch(console.error)
}

function getLatestIliasEntries () {
  if (gIliasApi !== null && gMainWindow !== null) {
    gIliasApi.getCurrentEntries()
      .then(a => {
        gMainWindow.webContents.send('render-elements-reply', convertIliasEntriesForClient(a))
      })
      .catch(console.error)
  } else {
    console.error('IliasAPI is null or there was no successful login!')
  }
}

/**
 * This tester does not like "user-name:password@..."
 * @author https://www.regextester.com/94502
 * @param {string} string Url to be checked
 * @returns {boolean} is valid url
 */
function isValidURL (string) {
  const res = string.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/g)
  return !(res == null)
}

/**
 * @param {import('./types').SettingsSet} arg
 */
function setSetting (arg) {
  // Check first if there was a change
  if (Settings.getModifiable(arg.id) !== arg.value) {
    // Make type checks
    switch (arg.type) {
      case 'toggle':
        if (typeof arg.value !== typeof true) {
          throw Error('A toggle setting can never not be a boolean!')
        }
        break
      case 'text':
      case 'password':
        if (typeof arg.value !== typeof '') {
          throw Error('A text/password setting can never not be a string!')
        }
        break
      case 'cronJob':
        if (typeof arg.value !== typeof '') {
          throw Error('A cron job setting can never not be a string!')
        }
        if (!cron.validate(arg.value)) {
          throw Error('The cron job setting is not valid!')
        }
        break
      case 'url':
        if (typeof arg.value !== typeof '') {
          throw Error('A url setting can never not be a string!')
        }
        // TODO This is not valid enough
        if (!isValidURL(arg.value)) {
          throw Error('The url setting is not valid!')
        }
        break
      default:
        throw Error('This type does not exist!')
    }
    Settings.setModifiable(arg.id, arg.value)
    if (arg.restart !== undefined && !arg.restart) {
      switch (arg.type) {
        case 'toggle':
          if (arg.id === 'autoLaunch') {
            setAutoLaunch()
          }
          if (arg.id === 'devMode') {
            arg.value ? gMainWindow.webContents.openDevTools() : gMainWindow.webContents.closeDevTools()
          }
          if (arg.id === 'checkForFeedCronJob') { setCronJobFeedUpdate() }
          if (arg.id === 'checkForUpdatesCronJob') { setCronJobProgramUpdate() }
          break
        case 'text':
          if (arg.id === 'userName') { loginIliasBuddy() }
          break
        case 'password':
          if (arg.id === 'userPassword') { loginIliasBuddy() }
          break
        case 'cronJob':
          if (arg.id === 'checkForFeedCronJobConfiguration') {
            setCronJobFeedUpdate()
          }
          if (arg.id === 'checkForUpdatesCronJobConfiguration') {
            setCronJobProgramUpdate()
          }
          break
        case 'url':
          if (arg.id === 'userUrl') { loginIliasBuddy() }
      }
    }
    gMainWindow.webContents.send('settings-set-answer', { ...arg, value: Settings.getModifiable(arg.id) })
  } else {
    console.log(`The setting "${arg.id}" did not change`)
  }
}

/* =====  Inter process communication listeners  ====== */

ipcMain
  .on('online-status-changed',
    /**
     * Get latest network state from renderer process
     * @param {boolean} onlineStatus True if online, False if offline
     */
    (event, onlineStatus) => {
      gOnline = onlineStatus
      atLeastOneFeedbackOnlineStatus = true
      loginIliasBuddy()
    })
  .on('ilias-login-check',
    /**
     * When the renderer process asks if the login to the Ilias API was successful
     * answer with true/false
     */
    event => {
      event.sender.send('ilias-login-update', gIliasApi !== null)
    })
  .on('test-and-login',
    /**
     * When a message is send from the renderer process check credentials and if
     * everything is OK login to API
     * @param {{ url: string, name: string, password: string }} message Message from renderer process
     */
    (event, message) => {
      // TODO - Type checks before checking for login
      checkIliasLogin(message.name, message.password, message.url)
        .then(() => {
          setSetting({ id: 'userName', value: message.name, documentId: 'settings-value-id-userName', type: 'text', restart: false })
          setSetting({ id: 'userPassword', value: message.password, documentId: 'settings-value-id-userPassword', type: 'text', restart: false })
          setSetting({ id: 'userUrl', value: message.url, documentId: 'settings-value-id-userUrl', type: 'text', restart: false })
          loginIliasBuddy()
        })
        .catch(err => {
          gMainWindow.webContents.send('error-dialog', { title: 'Ilias login error', message: err.message })
        })
    })
  .on('render-process-to-main-message',
    /**
     * When a message is send from the renderer process display it in the console
     * @param {string} message Message from renderer process
     */
    (event, message) => {
      console.log('Message:', message)
      event.sender.send('main-process-to-renderer-message', 'Hello from main.js to index.js')
    })
  .on('render-elements',
    /**
     * When the renderer process asks for the current Ilias entries send it to him
     */
    event => {
      getLatestIliasEntries()
    })
  .on('get-cache',
    /**
     * When the renderer process asks for the cached Ilias entries send it to him
     */
    event => {
      // Attention, this cache file is only current at the start, later in the game
      // it holds old information
      event.sender.send('get-cache-reply', convertIliasEntriesForClient(IliasBuddyApi.getCache()))
    })
  .on('getVersion', event => event.sender.send('version', app.getVersion()))
  .on('getName', event => event.sender.send('name', app.getName()))
  .on('getSettings', event => event.sender.send('settings', Settings.getModifiableSettings()))
  .on('settings-set',
    /**
     * @param {import('./types').SettingsSet} arg
     */
    (event, arg) => {
      setSetting(arg)
    })
  .on('settings-reset', /**
     * @param {import('./types').SettingsReset} arg
     */
    (event, arg) => {
      event.sender.send('settings-reset-answer',
        { ...arg, defaultValue: Settings.getModifiableDefault(arg.id) })
    })
  .on('show-and-focus-window', () => {
    gMainWindow.show()
    gMainWindow.focus()
  })
  .on('testSetSettings', (event, arg) => {
    // Check if any value has changed
    if (Settings.getModifiable(arg.id) !== arg.value) {
      console.log('There was a change', JSON.stringify(arg))
      Settings.setModifiable(arg.id, arg.value)
    }
  })
  .on('relaunch', (event, arg) => {
    // Save current opened screen
    Settings.setHidden('restartInfo', { openScreen: true, screenId: arg.screenId })
    // save settings before closing the app
    saveSettings()
    // close and reopen the app
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    app.exit(0)
  })

/* =====  Electron app listeners  ====== */

app
  // If a second instance is started reopen the first and quit the new one
  .on('second-instance', () => {
    if (gMainWindow) {
      gMainWindow.isMinimized() ? gMainWindow.restore() : gMainWindow.focus()
    }
  })
  // Create the window when electron has loaded
  .on('ready', () => createWindow())
  // When all windows were closed, close the program
  .on('window-all-closed', () => {
    // macOS: Applications keep their menu bar until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
  })
  .on('activate', () => {
    // macOS: Re-create a window in the app when the dock icon is clicked and there are no
    // other open windows
    if (gMainWindow === null) createWindow()
  })
