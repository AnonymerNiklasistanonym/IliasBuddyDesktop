/**
 * Main script of the electron application
 *
 * @summary Handles the app main process an thus window-creation/destruction,
 * encapsulated api-calls, ...
 * @author AnonymerNiklasistanyonym
 */

/* =====  TODO  ====== */

/* =====  Imports  ====== */

// npm modules
const { app, BrowserWindow, dialog, ipcMain,
  Menu, nativeImage, shell, Tray } = require('electron')
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
if (!app.requestSingleInstanceLock()) { app.quit() }

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
/**
 * Global variable to display if the ilias Api is ready
 * @type {boolean}
 */
let gIliasApiIsReady = false
/**
 * Global variable to display if the online Api is ready
 * @type {boolean}
 */
let gIliasOnlineIsReady = false
/**
 * Is true if there is currently an Ilias API login pending
 * @type {boolean}
 */
let gIliasApiPending = false
/**
 * Is true if there is currently a version check pending
 * @type {boolean}
 */
let gVersionCheckPending = false

/* =====  Global functions  ====== */

/**
 * Enable/disable the auto launch after settings
 */
function setAutoLaunch () {
  gAutoLaunch.isEnabled().then(isEnabled => {
    if (Settings.getModifiable('autoLaunch')) {
      // If it should be enabled but is not already enable it
      if (!isEnabled) { gAutoLaunch.enable() }
    } else {
      // If it should be disabled but is enabled on the system disable it
      if (isEnabled) { gAutoLaunch.disable() }
    }
  })
}

/**
 * Enable/disable/change a cron job
 * @param {ScheduledTask} cronJobVar The global cron job variable
 * @param {boolean} enableIt Should the cron job be enabled or destroyed
 * @param {string} cronJobString The cron job string expression
 * @param {Function} callback The callback that will be executed as cron job
 * @param {{ runInitially?: boolean; }} [options]
 */
function setCronJob (cronJobVar, enableIt, cronJobString, callback, options) {
  // First destroy the currently running cron job
  if (cronJobVar !== null) { cronJobVar.destroy() }
  // An then if wanted enable it again
  if (enableIt) {
    gCronJobProgramUpdate = cron.schedule(cronJobString, () => { callback() })
    // Check further options
    if (options !== undefined) {
      // If wanted run callback instantly once
      if (options.runInitially !== undefined && options.runInitially) {
        callback()
      }
    }
  }
}

/**
 * Enable/disable/change the program update cron job after settings
 * @param {boolean} [runInitially] Run the callback initially after set
 */
function setCronJobProgramUpdate (runInitially = false) {
  setCronJob(gCronJobProgramUpdate,
    Settings.getModifiable('checkForUpdatesCronJob'),
    Settings.getModifiable('checkForUpdatesCronJobConfiguration'),
    checkForUpdates, { runInitially })
}

/**
 * Enable/disable/change the feed update cron job
 * @param {boolean} [runInitially] Run the callback initially after set
 */
function setCronJobFeedUpdate (runInitially = false) {
  setCronJob(gCronJobFeedUpdate,
    Settings.getModifiable('checkForFeedCronJob'),
    Settings.getModifiable('checkForFeedCronJobConfiguration'),
    () => {
      if (gIliasApi !== null) {
        gIliasApi.manageEntries.getCurrentEntries(true).catch(console.error)
      }
    }, { runInitially })
}

/**
 * Message renderer window about a login test
 * @param {string} errorMessage
 */
function broadcastIliasLoginUpdate (errorMessage) {
  const ready = gIliasApiIsReady
  const iliasApiState = gIliasApi !== null

  if (errorMessage === undefined) {
    gMainWindow.webContents.send('ilias-login-update', { iliasApiState, ready })
  } else {
    const userPassword = Settings.getModifiable('userPassword')
    const userPasswordDefault = Settings.getModifiableDefault('userPassword')
    const userName = Settings.getModifiable('userName')
    const userNameDefault = Settings.getModifiableDefault('userName')
    const userUrl = Settings.getModifiable('userUrl')
    const userUrlDefault = Settings.getModifiableDefault('userUrl')
    gMainWindow.webContents.send('ilias-login-update', {
      errorMessage,
      iliasApiState,
      name: {
        defaultValue: userNameDefault,
        value: userName === userNameDefault ? '' : userName
      },
      password: {
        defaultValue: userPasswordDefault,
        value: userPassword === userPasswordDefault ? '' : userPassword
      },
      ready,
      url: {
        defaultValue: userUrlDefault,
        value: userUrl === userUrlDefault ? '' : userUrl
      }
    })
  }
}

/**
 * Try to connect the user to a private RSS feed
 */
function connectToIliasRssFeed () {
  // Check first if an online state is known, else stop
  if (!gIliasOnlineIsReady) { return }
  // Check then if this method is already running
  if (gIliasApiPending) { return }

  gIliasApiPending = true
  // Check first if online
  if (!gOnline) {
    gIliasApiIsReady = true
    broadcastIliasLoginUpdate('Device is not online')
    gIliasApiPending = false
  } else {
    // If online check if the credentials are correct
    checkIliasLogin()
      .then(() => {
        loginToIliasApi()
        gIliasApiIsReady = true
        broadcastIliasLoginUpdate()
        gIliasApiPending = false
      })
      .catch(err => {
        gIliasApiIsReady = true
        broadcastIliasLoginUpdate(err.message)
        gIliasApiPending = false
      })
  }
}

/**
 * Relaunch the whole application
 */
function relaunchApp () {
  // Save settings before closing the app
  saveSettings()
  // Close and reopen the app
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
  app.exit(0)
}

// TODO
/**
 * Check if the credentials/internet connection are correct
 * @param {{ userName?: string; userName?: string; userName?: string; }} login
 * @returns {Promise<boolean>}
 */
function checkIliasLogin (login) {
  let userName = Settings.getModifiable('userName')
  let password = Settings.getModifiable('userPassword')
  let userUrl = Settings.getModifiable('userUrl')
  if (login !== undefined) {
    if (login.userName !== undefined) { userName = login.userName }
    if (login.password !== undefined) { password = login.password }
    if (login.userUrl !== undefined) { userUrl = login.userUrl }
  }
  return new Promise((resolve, reject) => {
    if (userName !== undefined && password !== undefined &&
        userUrl !== undefined) {
      IliasBuddyApi.testConnection(userUrl, userName, password)
        .then(resolve).catch(reject)
    } else {
      reject(Error('Not all settings were found setup (' +
        `user name: ${userName !== undefined}, ` +
        `password: ${password !== undefined}, ` +
        `url: ${url !== undefined}` + ')'))
    }
  })
}

// TODO
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
  // Try to login to ilias API
  connectToIliasRssFeed()

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
  setCronJobProgramUpdate(false)

  // Start feed update cron job if wanted
  setCronJobFeedUpdate(false)
}

/**
 * Create the main window
 */
function createWindow () {
  // Get settings that are used more than once
  const settingsWindowBounds = Settings.getHidden('windowBounds')
  const settingsMinWindowBounds = Settings.getHidden('minWindowBounds')
  const settingsNativeTitleBar = Settings.getModifiable('nativeTitleBar')
  const settingsSystemTray = Settings.getModifiable('minimizeToSystemTray')

  // Icon path
  const iconPath = path.join(__dirname, 'images', 'favicon', 'favicon.ico')

  // Create a BrowserWindow object
  gMainWindow = new BrowserWindow({
    center: settingsWindowBounds.x === 0 && settingsWindowBounds.y === 0,
    frame: settingsNativeTitleBar,
    height: settingsWindowBounds.height,
    icon: iconPath,
    minHeight: settingsMinWindowBounds.height,
    minWidth: settingsMinWindowBounds.width,
    show: false, // do not show the window before content is loaded
    title: app.getName(),
    titleBarStyle: 'hidden', // macOS: buttons are an overlay
    // Enable node integration in window
    webPreferences: { nodeIntegration: true },
    width: settingsWindowBounds.width,
    x: settingsWindowBounds.x,
    y: settingsWindowBounds.y
  })

  // Load the 'index.html' file in the window
  gMainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Menu bar with links to all available screens
  Menu.setApplicationMenu(Menu.buildFromTemplate([{
    click () {
      gMainWindow.webContents.send('open-window', { screenId: 'main' })
    },
    label: 'Current Feed'
  }, {
    click () {
      gMainWindow.webContents.send('open-window', { screenId: 'saved' })
    },
    label: 'Saved Feed'
  }, {
    click () {
      gMainWindow.webContents.send('open-window', { screenId: 'links' })
    },
    label: 'Links'
  }, {
    click () {
      gMainWindow.webContents.send('open-window', { screenId: 'settings' })
    },
    label: 'Settings'
  }, {
    click () {
      gMainWindow.webContents.send('open-window', { screenId: 'info' })
    },
    label: 'About'
  }]))

  // If wanted create system tray
  if (settingsSystemTray) {
    const systemTray = new Tray(nativeImage.createFromPath(iconPath))
    systemTray.setToolTip('IliasBuddy')
    systemTray.setContextMenu(Menu.buildFromTemplate([
      { click: function () {
        if (gMainWindow.isVisible()) {
          gMainWindow.focus()
        } else {
          gMainWindow.show()
        }
      },
      label: 'Show App' },
      { click: function () {
        app.quit()
      },
      label: 'Quit' }
    ]))
    systemTray.on('click', () => {
      if (gMainWindow) {
        gMainWindow.isVisible() ? gMainWindow.focus() : gMainWindow.show()
      }
    })
  }

  gMainWindow.webContents
    // Prevent the browser window from opening websites in it
    .on('will-navigate', (event, urlToBeOpened) => {
      event.preventDefault()
      if (urlToBeOpened.startsWith('http:') ||
          urlToBeOpened.startsWith('https:')) {
        shell.openExternal(urlToBeOpened)
      } else {
        dialog.showErrorBox('Error', `URL is not safe?\n(${urlToBeOpened})`)
      }
    })

  // window event listener that only get called once
  gMainWindow
    .once('ready-to-show', () => {
      console.debug('.once(\'ready-to-show\'')
      setupAfterWindowHasLoaded()
    })

  // window event listener
  gMainWindow
    .on('ready-to-show', () => {
      console.debug('.on(\'ready-to-show\'')
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
      gMainWindow.webContents.session.clearCache(() => undefined)
      gMainWindow.webContents.clearHistory()
    })
    .on('closed', () => {
      // Dereference the window object
      gMainWindow = null
    })
    .on('minimize', function (event) {
      // If wanted hide the window to the system tray if minimized
      if (settingsSystemTray) {
        event.preventDefault()
        gMainWindow.hide()
      }
    })

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
  // Stop instantly if a version check is already running
  if (gVersionCheckPending) { return }

  gVersionCheckPending = true

  VersionChecker.getLatestTagGithub(
    Settings.getHidden('githubLatestReleaseUrl'))
    .then(json => {
      if (json.tag_name !== 'v' + app.getVersion()) {
        gMainWindow.webContents.send('new-version-detected', json)
      }
      gVersionCheckPending = false
    })
    .catch(err => {
      console.error(err)
      gMainWindow.webContents.send('error-dialog', {
        message: err.message,
        title: 'Version check error'
      })
      gVersionCheckPending = false
    })
}

function getLatestIliasEntries () {
  if (gIliasApi !== null && gMainWindow !== null) {
    gIliasApi.getCurrentEntries()
      .then(a => {
        gMainWindow.webContents.send('render-elements-reply',
          convertIliasEntriesForClient(a))
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
  // tslint:disable-next-line:max-line-length
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
          if (arg.id === 'checkForFeedCronJob') { setCronJobFeedUpdate(true) }
          if (arg.id === 'checkForUpdatesCronJob') { setCronJobProgramUpdate(true) }
          break
        case 'text':
          if (arg.id === 'userName') { connectToIliasRssFeed() }
          break
        case 'password':
          if (arg.id === 'userPassword') { connectToIliasRssFeed() }
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
          if (arg.id === 'userUrl') { connectToIliasRssFeed() }
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
      gIliasOnlineIsReady = true
      connectToIliasRssFeed()
    })
  .on('ilias-login-check',
    /**
     * When the renderer process asks if the login to the Ilias API was successful
     * answer with true/false
     */
    event => event.sender.send('ilias-login-update', {
      ready: gIliasApiIsReady,
      iliasApiState: gIliasApi !== null
    }))
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
          setSetting({ id: 'userName', value: message.name, resetDocumentId: 'settings-value-id-userName', type: 'text', restart: false })
          setSetting({ id: 'userPassword', value: message.password, resetDocumentId: 'settings-value-id-userPassword', type: 'text', restart: false })
          setSetting({ id: 'userUrl', value: message.url, resetDocumentId: 'settings-value-id-userUrl', type: 'text', restart: false })
          connectToIliasRssFeed(true)
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
  .on('settings-reset',
    /**
     * @param {import('./types').SettingsResetInfoObject} arg
     */
    (event, arg) => {
      const settingsObject = Settings.getModifiableSetting(arg.id)
      if (settingsObject !== undefined) {
        event.sender.send('settings-reset-answer', {
          documentId: arg.resetDocumentId,
          id: arg.id,
          type: settingsObject.type,
          valueDefault: settingsObject.valueDefault
        })
      } else {
        console.error('Settings object not found!')
      }
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
    relaunchApp()
  })
  .on('native-title-bar-check', event => event.sender.send('set-native-title-bar',
    Settings.getModifiable('nativeTitleBar')))

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
    if (process.platform !== 'darwin') { app.quit() }
  })
  .on('activate', () => {
    // macOS: Re-create a window in the app when the dock icon is clicked and there are no
    // other open windows
    if (gMainWindow === null) { createWindow() }
  })
