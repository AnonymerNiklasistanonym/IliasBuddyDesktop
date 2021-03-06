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
const {
  app, BrowserWindow, dialog, globalShortcut, ipcMain,
  Menu, nativeImage, shell, Tray
} = require('electron')
const path = require('path')
const url = require('url')
const AutoLaunch = require('auto-launch')
const cron = require('node-cron')
const log = require('electron-log')
const events = require('events')
// custom modules
const VersionChecker = require('./modules/VersionChecker/API/VersionChecker')
const Settings = require('./modules/Settings/API/Settings')
const IliasBuddyApi = require('./modules/IliasBuddy/API/IliasBuddyApi')

/* =====  Logging  ====== */

// error, warn, info, verbose, debug, silly
log.transports.console.level = 'debug'
log.transports.file.level = 'debug'
log.debugMain = parameter => log.debug('[main] ' + parameter)

/* =====  Startup checks  ====== */

// Only one instance of the program should run - quit if this is the >= 2nd
if (!app.requestSingleInstanceLock()) {
  log.debugMain('App is shutting down because of an already running instance')
  app.quit()
}

/* =====  Global constants  ====== */

/**
 * Event emitter
 */
const eventEmitter = new events.EventEmitter()

/* =====  Global variables  ====== */

/**
 * Global GUI window
 * @type {Electron.BrowserWindow}
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
const gCronJobFeedUpdate = null
/**
 * Global interface to connect to and use the Ilias RSS feed
 * @type {IliasBuddyApi}
 */
let gIliasApi = null
/**
 * Global indictor if computer is offline/online
 */
let gOnline = false
/**
 * Global variable to enable/disable auto launch
 * @type {AutoLaunch}
 */
let gAutoLaunch = null
/**
 * Global variable to display if the ilias Api is ready
 */
let gIliasApiIsReady = false
/**
 * Global variable to display if the online Api is ready
 */
let gIliasOnlineIsReady = false
/**
 * Is true if there is currently an Ilias API login pending
 */
let gIliasApiPending = false
/**
 * Is true if there is currently a version check pending
 */
let gVersionCheckPending = false
/**
 * Is true if there is currently a version check pending
 */
let gWindowSetupAfterExecuted = false

/* =====  Global functions  ====== */

/**
 * Enable/disable the auto launch (in respect to the settings)
 */
function setAutoLaunch () {
  // Check if auto launch was instantiated
  if (gAutoLaunch === null) {
    throw Error('Auto launch object cannot be null!')
  }
  // Then ask it if it's already enabled
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
 * @param {cron.ScheduledTask} cronJobVar The global cron job variable
 * @param {boolean} enableIt Should the cron job be enabled or destroyed
 * @param {string} cronJobString The cron job string expression
 * @param {Function} callback The callback that will be executed as cron job
 * @param {import('./mainTypes').SetCronJobOptions} [options] Further options
 */
function setCronJob (cronJobVar, enableIt, cronJobString, callback, options) {
  // First destroy the currently running cron job
  if (cronJobVar !== null) { cronJobVar.destroy() }
  // An then if wanted enable it again
  if (enableIt) {
    gCronJobProgramUpdate = cron.schedule(cronJobString, () => {
      callback()
      log.debugMain(`Cron Job was executed (${cronJobString})`)
    })
    // Check further options
    if (options !== undefined) {
      // If wanted run callback instantly once
      if (options.runInitially !== undefined && options.runInitially) {
        callback()
        log.debugMain(`Cron Job was run initially (${cronJobString})`)
      }
    }
  }
}

/**
 * Enable/disable/change the program update cron job (in respect to the
 * settings)
 * @param {boolean} [runInitially] Run the callback initially after set = true
 */
function setCronJobProgramUpdate (runInitially = false) {
  log.debugMain(`Set Cron Job [ProgramUpdate] (runInitially=${runInitially})`)
  setCronJob(gCronJobProgramUpdate,
    Settings.getModifiable('checkForUpdatesCronJob'),
    Settings.getModifiable('checkForUpdatesCronJobConfiguration'),
    checkForProgramUpdates, { runInitially })
}

/**
 * Enable/disable/change the feed update cron job (in respect to the settings)
 * @param {boolean} [runInitially] Run the callback initially after set = true
 */
function setCronJobFeedUpdate (runInitially = false) {
  log.debugMain(`Set Cron Job [FeedUpdate] (runInitially=${runInitially})`)
  setCronJob(gCronJobFeedUpdate,
    Settings.getModifiable('checkForFeedCronJob'),
    Settings.getModifiable('checkForFeedCronJobConfiguration'),
    checkForFeedUpdates, { runInitially })
}

/**
 * Check for program updates (new version)
 */
function checkForProgramUpdates () {
  log.debugMain('Check for program updates')
  // If not online do nothing
  if (!gOnline) {
    log.debugMain('Program update stopped because the device is not online')
    return
  }
  // Stop instantly if a version check is already running
  if (gVersionCheckPending) { return }
  gVersionCheckPending = true

  // Get the latest GitHub release tag information
  VersionChecker.getLatestTagGithub(
    Settings.getHidden('githubLatestReleaseUrl'))
    .then(json => {
      log.debugMain(`Current version: ${'v' + app.getVersion()}, ` +
        `Fetched version: ${json.tag_name}`)
      // Check if the release tag version is newer than the app version
      if (VersionChecker.checkIfTagIsNewer(app.getVersion(), json.tag_name)) {
        log.debugMain(`<broadcast> "new-version-detected" (${json.tag_name})`)
        // If yes broadcast information
        gMainWindow.webContents.send('new-version-detected', {
          date: json.created_at,
          newVersion: json.tag_name,
          releaseNotes: json.body,
          url: json.html_url
        })
      }
    })
    .catch(err => { broadcastError('Version check error', err) })
    .then(() => {
      // Always do the following at the end
      gVersionCheckPending = false
    })
}

/**
 * Broadcasts error message
 * @param {string} title Title of error
 * @param {Error} err Error
 */
function broadcastError (title, err) {
  log.debugMain(`<broadcast> "error-dialog" (${title})`)
  log.error(err)
  gMainWindow.webContents.send('error-dialog', { message: err.message, title })
}

/**
 * Check for Ilias feed updates (new entries)
 */
function checkForFeedUpdates () {
  log.debugMain('Check for feed updates')
  // If not online do nothing
  if (!gOnline) {
    log.debugMain('Feed update stopped because the device is not online')
    return
  }
  // If Ilias API is null return
  if (gIliasApi === null) {
    log.debugMain('Feed update stopped because the Ilias API is not configured')
    return
  }
  // Else get the current feed
  gIliasApi.getCurrentEntries(true)
    .catch(err => { broadcastError('Check current feed error', err) })
}

/**
 * Message renderer window about a login test
 * @param {string} [errorMessage] Error message if there was an error
 */
function broadcastIliasLoginUpdate (errorMessage) {
  log.debugMain('<broadcast> "ilias-login-update"')
  // Determine the current state of the gIliasApi and if it is even ready
  const ready = gIliasApiIsReady
  const iliasApiState = gIliasApi !== null
  if (errorMessage === undefined) {
    // If there is no error message only send that everything is ready
    gMainWindow.webContents.send('ilias-login-update', { iliasApiState, ready })
  } else {
    // Else also send back the current values for name/url and error message
    const userPasswordDefault = Settings.getModifiable('userPassword')
    const userName = Settings.getModifiable('userName')
    const userNameDefault = Settings.getModifiableDefault('userName')
    const userUrl = Settings.getModifiable('userUrl')
    const userUrlDefault = Settings.getModifiableDefault('userUrl')
    gMainWindow.webContents.send('ilias-login-update', {
      errorMessage,
      iliasApiState,
      name: {
        value: userName === userNameDefault ? '' : userName,
        valueDefault: userNameDefault
      },
      password: {
        valueDefault: userPasswordDefault
      },
      ready,
      url: {
        value: userUrl === userUrlDefault ? '' : userUrl,
        valueDefault: userUrlDefault
      }
    })
  }
}

/**
 * Try to connect the user to a private RSS feed
 * @returns {Promise<void>}
 */
function connectToIliasRssFeed () {
  log.debug('connectToIliasRssFeed')
  // Check first if an online state is known, else stop
  if (!gIliasOnlineIsReady) {
    return Promise.reject(Error('Online state is not yet ready'))
  }
  // Check then if this method is already running
  if (gIliasApiPending) {
    return Promise.reject(Error('Another connection request is still pending'))
  }

  gIliasApiPending = true
  // Check first if online
  if (!gOnline) {
    gIliasApiIsReady = true
    broadcastIliasLoginUpdate('Device is not online')
    gIliasApiPending = false
    return Promise.reject(Error('Device is not online'))
  } else {
    // If online check if the credentials are correct
    return new Promise((resolve, reject) => {
      log.debugMain('connectToIliasRssFeed > check Ilias login')
      checkIfIliasLoginIsPossible()
        .then(() => {
          loginToIliasApi()
          gIliasApiIsReady = true
          broadcastIliasLoginUpdate()
          resolve()
        })
        .catch(err => {
          gIliasApiIsReady = true
          broadcastIliasLoginUpdate(err.message)
          reject(err)
        })
        .then(() => {
          gIliasApiPending = false
        })
    })
  }
}

/**
 * Relaunch the whole application
 */
function relaunchApp () {
  log.debug(`relaunchApp ${JSON.stringify(Settings.getHidden('restartInfo'))}`)
  // Save settings before closing the app
  saveSettings()
  // Close and reopen the app
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
  app.exit(0)
}

/**
 * Check if the credentials/internet connection are correct for a successful
 * login
 * @param {import('./mainTypes').CheckIliasLogin} login
 * @returns {Promise<void>}
 */
function checkIfIliasLoginIsPossible (login) {
  log.debugMain('checkIliasLogin')
  // Get the current values of the user name/password and url
  let userName = Settings.getModifiable('userName')
  let password = Settings.getModifiable('userPassword')
  let userUrl = Settings.getModifiable('userUrl')
  // If the login object is not undefined supplement these values
  if (login !== undefined) {
    if (login.userName !== undefined) { userName = login.userName }
    if (login.password !== undefined) { password = login.password }
    if (login.userUrl !== undefined) { userUrl = login.userUrl }
  }
  // Then check if any of the values are still undefined
  if (userName === undefined || password === undefined ||
      userUrl === undefined) {
    return Promise.reject(Error('Not all settings were found setup (' +
    `user name: ${userName !== undefined}, ` +
    `password: ${password !== undefined}, ` +
    `url: ${url !== undefined}` + ')'))
  }
  // If all values exist test connection
  return IliasBuddyApi.testConnection(userUrl, userName, password)
}

/**
 * Set {@link gIliasApi} variable. Run this after a successful login check
 * ({@link checkIfIliasLoginIsPossible}).
 */
function loginToIliasApi () {
  log.debugMain('loginToIliasApi')
  // Get the current validated feed login variables
  const settingsFeedUserName = Settings.getModifiable('userName')
  const settingsFeedPassword = Settings.getModifiable('userPassword')
  const settingsFeedUrl = Settings.getModifiable('userUrl')
  // Set Ilias API variable with working instance
  gIliasApi = new IliasBuddyApi(settingsFeedUrl, settingsFeedUserName,
    settingsFeedPassword, newEntries => {
      log.debugMain('gIliasApi new Entries callback')
      // When new entries are found check first if there are even new entries
      if (newEntries === undefined || !Array.isArray(newEntries) ||
          newEntries.length === 0) {
        log.debugMain('gIliasApi new entries callback was empty/undefined!')
      } else {
        log.debugMain('gIliasApi new entries callback with entries')
        // If there are new entires send them to the renderer process
        sendNewIliasEntries(newEntries)
      }
    })
}

/**
 * Send new entries rendered to the client
 * @param {import('./modules/IliasBuddy/PARSER/RawEntryParserTypes')
 * .IliasBuddyRawEntryParser.Entry[]} newEntries New Ilias entries
 */
function sendNewIliasEntries (newEntries) {
  log.debugMain(`sendNewIliasEntries to render process (${newEntries.length})`)
  gMainWindow.webContents.send('new-entries',
    convertIliasEntriesForClient(newEntries))
}

/**
 * Convert Ilias API new entries to rendered HTML strings
 * @param {import("./modules/IliasBuddy/PARSER/RawEntryParserTypes")
 * .IliasBuddyRawEntryParser.Entry[]} entries
 * @returns {string[]}
 */
function convertIliasEntriesForClient (entries) {
  return IliasBuddyApi.renderEntriesHtml(entries).reverse()
}

/**
 * Initial setup after window is created and loaded
 */
function setupAfterWindowHasLoaded () {
  log.debugMain('setupAfterWindowHasLoaded')
  if (gWindowSetupAfterExecuted) {
    log.debugMain('setupAfterWindowHasLoaded was already executed!')
    return
  }
  gWindowSetupAfterExecuted = true

  // Register keyboard shortcut to show/hide app
  setGlobalKeyboardShortShowApp()

  // Try to login to ilias API
  const tryIliasLogin = () => {
    log.debugMain(`tryIliasLogin > online-state-callback (online=${gOnline})`)
    // Try to login to ilias API
    if (!gOnline) {
      broadcastError('Online state', Error('Device is offline'))
    } else {
      connectToIliasRssFeed().then(() => {
        log.debugMain('Login successful, check for feed updates')
        // Always check for feed updates on start
        checkForFeedUpdates()
      }).catch(err => {
        // If there was an error connecting to the ilias feed do nothing but log
        // it because the error is already dealt with via the method
        // "connectToIliasRssFeed"
        log.error(err)
      })
    }
  }
  // If online state is not yet clear wait till online state is clear
  if (gIliasOnlineIsReady && gOnline) {
    log.debugMain(`online-state was already ready ${gOnline}`)
    tryIliasLogin()
  } else {
    log.debugMain('wait for online-state')
    eventEmitter.once('device-is-online', tryIliasLogin)
  }

  // Create auto launch object
  gAutoLaunch = new AutoLaunch({ name: 'test', isHidden: true })
  // Get if auto launch should be enabled/disabled per setting
  setAutoLaunch()

  // If auto launch is enabled minimize the window on start
  const restartInfo = Settings.getHidden('restartInfo')
  log.debugMain(`restartInfo after launch ${JSON.stringify(restartInfo)}`)
  if (restartInfo.openScreen) {
    // Show and focus it
    gMainWindow.show()
    gMainWindow.focus()
    // And broadcast to open the saved window
    broadcastOpenScreen(restartInfo.screenId)
    // And overwrite settings object so that the next relaunch is silent again
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
    checkForProgramUpdates()
  }

  // Start program update cron job if wanted
  setCronJobProgramUpdate(false)

  // Start feed update cron job if wanted
  setCronJobFeedUpdate(false)
}

/**
 * Broadcast app to open a screen
 */
function broadcastOpenScreen (screenId) {
  log.debugMain(`<broadcast> "open-window" (screenId=${screenId})`)
  gMainWindow.webContents.send('open-window', { screenId })
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
    title: app.name,
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
    accelerator: 'CmdOrCtrl+1',
    click () { broadcastOpenScreen('main') },
    label: 'Current Feed'
  }, {
    accelerator: 'CmdOrCtrl+2',
    click () { broadcastOpenScreen('saved') },
    label: 'Saved Feed'
  }, {
    accelerator: 'CmdOrCtrl+L',
    click () { broadcastOpenScreen('links') },
    label: 'Links'
  }, {
    accelerator: 'CmdOrCtrl+S',
    click () { broadcastOpenScreen('settings') },
    label: 'Settings'
  }, {
    accelerator: 'F1',
    click () { broadcastOpenScreen('info') },
    label: 'About'
  }]))

  // If wanted create system tray
  if (settingsSystemTray) {
    const systemTray = new Tray(nativeImage.createFromPath(iconPath))
    systemTray.setToolTip('IliasBuddy')
    systemTray.setContextMenu(Menu.buildFromTemplate([
      {
        click: () => {
          if (gMainWindow.isVisible()) {
            gMainWindow.focus()
          } else {
            gMainWindow.show()
          }
        },
        label: 'Show App'
      },
      {
        click: () => {
          app.quit()
        },
        label: 'Quit'
      }
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
      log.debugMain('.once(\'ready-to-show\'')
      setupAfterWindowHasLoaded()
    })

  // window event listener
  gMainWindow
    .on('ready-to-show', () => {
      // log.debugMain('.on(\'ready-to-show\'')
      // setupAfterWindowHasLoaded()
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

  // setupAfterWindowHasLoaded()
}

/**
 * Save current settings (+ window size/position) in preferences file
 */
function saveSettings () {
  if (gIliasApi !== null) {
    gIliasApi.manageEntries.saveCache()
  }
  Settings.setHidden('windowBounds', gMainWindow.getBounds())
}

/**
 * Show/Hide window (toggle)
 */
function showHideWindow () {
  if (gMainWindow.isVisible()) {
    gMainWindow.hide()
  } else {
    gMainWindow.show()
    gMainWindow.focus()
  }
}

/**
 * Set a setting
 * @param {import('./mainTypes').SettingsSet} arg Setting information
 */
// tslint:disable-next-line: cyclomatic-complexity
function setSetting (arg) {
  // Check first if there was even a change
  if (Settings.getModifiable(arg.id) === arg.value) { return }
  // Than make type checks
  Settings.makeModifiableTypeChecks(arg.type, arg.value)
  // TODO Save current value and reset setting when there was any error
  const oldValue = Settings.getModifiable(arg.id)
  // Set setting
  Settings.setModifiable(arg.id, arg.value)
  // Check for additional options
  if (arg.restart !== undefined && !arg.restart) {
    switch (arg.type) {
      case 'toggle':
        if (arg.id === 'autoLaunch') {
          setAutoLaunch()
        }
        if (arg.id === 'devMode') {
          arg.value ? gMainWindow.webContents.openDevTools()
            : gMainWindow.webContents.closeDevTools()
        }
        if (arg.id === 'checkForFeedCronJob') {
          setCronJobFeedUpdate(true)
        }
        if (arg.id === 'checkForUpdatesCronJob') {
          setCronJobProgramUpdate(true)
        }
        break
      case 'text':
        if (arg.id === 'userName') {
          connectToIliasRssFeed().catch(err => {
            broadcastError('Settings update, user name error', err)
          })
        }
        break
      case 'password':
        if (arg.id === 'userPassword') {
          connectToIliasRssFeed().catch(err => {
            broadcastError('Settings update, user password error', err)
          })
        }
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
        if (arg.id === 'userUrl') {
          connectToIliasRssFeed().catch(err => {
            broadcastError('Settings update, user URL error', err)
          })
        }
        break
      case 'keyboardShortcut':
        if (arg.id === 'globalShortcutShow') {
          setGlobalKeyboardShortShowApp(oldValue)
        }
    }
  }
  // Finally send message to the renderer process
  gMainWindow.webContents.send('settings-set-answer',
    { ...arg, value: Settings.getModifiable(arg.id) })
}

/**
 * Set global keyboard shortcut to show/hide app with one combination
 * @param {string} [oldValue]
 */
function setGlobalKeyboardShortShowApp (oldValue) {
  if (oldValue !== undefined) {
    try { globalShortcut.unregister(oldValue) } catch (e) {
      log.debugMain('Shortcut could not be unregistered: ' + e.message)
    }
  }
  // Try to set new shortcut
  const shortcutValue = Settings.getModifiable('globalShortcutShow')
  try {
    globalShortcut.register(shortcutValue, () => {
      log.debugMain(`|${shortcutValue}| Show/Hide app shortcut`)
      showHideWindow()
    })
  } catch (e) {
    broadcastError('Keyboard shortcut (Show app) could not be registered', e)
    if (oldValue !== undefined) {
      // Register old shortcut again and reset setting
      Settings.setModifiable('globalShortcutShow', oldValue)
      setGlobalKeyboardShortShowApp()
    }
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
      // Set global online state
      gOnline = onlineStatus
      // Mark online state is safe to evaluate
      gIliasOnlineIsReady = true
      // Fire event that online state is ready an true
      if (gOnline) {
        eventEmitter.emit('device-is-online')
      }
    })
  .on('ilias-login-check', () => { broadcastIliasLoginUpdate() })
  .on('test-and-login',
    /**
     * When a message is send from the renderer process check credentials and if
     * everything is OK login to API
     * @param {{ url: string, name: string, password: string }} message
     * Message from renderer process
     */
    (event, message) => {
      // TODO - Type checks before checking for login
      checkIfIliasLoginIsPossible({
        password: message.password,
        userName: message.name,
        userUrl: message.url
      })
        .then(() => {
          setSetting({
            id: 'userName',
            resetDocumentId: 'settings-value-id-userName',
            restart: false,
            type: 'text',
            value: message.name
          })
          setSetting({
            id: 'userPassword',
            resetDocumentId: 'settings-value-id-userPassword',
            restart: false,
            type: 'text',
            value: message.password
          })
          setSetting({
            id: 'userUrl',
            resetDocumentId: 'settings-value-id-userUrl',
            restart: false,
            type: 'text',
            value: message.url
          })
          connectToIliasRssFeed(true)
        })
        .catch(err => { broadcastError('Ilias login error ???', err) })
    })
  .on('render-process-to-main-message',
    /**
     * When a message is send from the renderer process display it in the
     * console
     * @param {string} message Message from renderer process
     */
    (event, message) => {
      console.info('Message:', message)
      event.sender.send('main-process-to-renderer-message',
        'Hello from main.js to index.js')
    })
  .on('get-cache-request',
    /**
     * When the renderer process asks for the cached Ilias entries send it to
     * him
     */
    event => {
      // Attention, this cache file is only current at the start, later in the
      // game it holds old information (not any more, but here a fixes to come)
      event.sender.send('get-cache-reply',
        convertIliasEntriesForClient(IliasBuddyApi.getCache()))
    })
  .on('getVersion', event => event.sender.send('version', app.getVersion()))
  .on('getName', event => event.sender.send('name', app.name))
  .on('getSettings', event => event.sender.send('settings',
    Settings.getModifiableSettings()))
  .on('settings-set',
    /**
     * @param {import('./mainTypes').SettingsSet} arg
     */
    (event, arg) => {
      log.debugMain('<request> settings-set')
      setSetting(arg)
    })
  .on('settings-reset',
    /**
     * @param {import('./mainTypes').SettingsResetQuestion} arg
     */
    (event, arg) => {
      log.debugMain('<request> settings-reset')
      const settingsObject = Settings.getModifiableSetting(arg.id)
      if (settingsObject !== undefined) {
        // Do only return empty strings for user name/password/url
        if (settingsObject.id === 'userName' ||
            settingsObject.id === 'userPassword' ||
            settingsObject.id === 'userUrl') {
          settingsObject.valueDefault = ''
        }
        event.sender.send('settings-reset-answer', {
          documentId: arg.documentId,
          id: arg.id,
          type: settingsObject.type,
          valueDefault: settingsObject.valueDefault
        })
      } else {
        broadcastError('Settings reset request error',
          Error('Settings object not found!'))
      }
    })
  .on('show-and-focus-window', () => {
    log.debugMain('<request> show-and-focus-window')
    gMainWindow.show()
    gMainWindow.focus()
  })
  .on('testSetSettings', (event, arg) => {
    // Check if any value has changed
    if (Settings.getModifiable(arg.id) !== arg.value) {
      Settings.setModifiable(arg.id, arg.value)
    }
  })
  .on('relaunch', (event, arg) => {
    // Save current opened screen
    Settings.setHidden('restartInfo',
      { openScreen: true, screenId: arg.screenId })
    relaunchApp()
  })
  .on('native-title-bar-check', event => event.sender
    .send('set-native-title-bar', Settings.getModifiable('nativeTitleBar')))
  .on('new-version-check', () => { checkForProgramUpdates() })

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
    // macOS: Applications keep their menu bar until the user quits explicitly
    // with Cmd + Q
    if (process.platform !== 'darwin') { app.quit() }
  })
  .on('activate', () => {
    // macOS: Re-create a window in the app when the dock icon is clicked and
    // there are no other open windows
    if (gMainWindow === null) { createWindow() }
  })
