/**
 * Main script of the electron application
 *
 * @summary handles the app start/close, main process, windows, ...
 * @author AnonymerNiklasistanyonym
 */

/* =====  Imports  ====== */

const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, shell, nativeImage } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const VersionChecker = require('./modules/IliasBuddy/Other/VersionChecker')
const Settings = require('./modules/Settings/API/Settings')
const IliasBuddyApi = require('./modules/IliasBuddy/API/IliasBuddyApi')
const AutoLaunch = require('auto-launch')
const cron = require('node-cron')

// TODO: Update checker
// TODO: Settings IPC listener

// global variables

/**
 * GUI window
 * @type {BrowserWindow}
 */
var mainWindow = null
/**
 * Cron job for program updates
 * @type {cron.ScheduledTask}
 */
var cronJobProgramUpdates = null
/**
 * Cron job for feed updates
 * @type {cron.ScheduledTask}
 */
var cronJobFeedUpdates = null
/**
 * IliasApi
 * @type {IliasBuddyApi}
 */
var iliasApi = null

// Only one instance of the program should run
if (!app.requestSingleInstanceLock()) app.quit()

// Check if IliasApi has credentials
let iliasApiLoggedIn = false
{
  const settingsFeedUserName = Settings.getModifiable('userName')
  const settingsFeedPassword = Settings.getModifiable('userPassword')
  const settingsFeedUrl = Settings.getModifiable('userUrl')
  console.log('settingsFeedUserName', settingsFeedUserName)
  console.log('settingsFeedPassword', settingsFeedPassword)
  console.log('settingsFeedUrl', settingsFeedUrl)
  if (settingsFeedUserName !== undefined &&
    settingsFeedPassword !== undefined &&
    settingsFeedUrl !== undefined) {
    iliasApiLoggedIn = true
    iliasApi = new IliasBuddyApi(settingsFeedUrl, settingsFeedUserName, settingsFeedPassword, newEntries => {
      console.log('Main >> New entries >>', newEntries.length)
      if (newEntries !== undefined && newEntries.length > 0) {
        mainWindow.webContents.send('new-entries', newEntries)
      }
    })
  } else {
    console.error('IliasApi - No login found!')
  }
}

// inter process communication listeners
ipcMain
  .on('ilias-login-check', (event, args) => {
    event.sender.send('ilias-login-check-answer', iliasApiLoggedIn)
  })
  .on('render-process-to-main-message', (event, arg) => {
    console.log('Message:', arg)
    mainWindow.webContents.send('main-process-to-renderer-message', 'Hello from main.js to index.js')
    mainWindow.webContents.send('cron-job-debug', 'Hello')
  })
  .on('render-elements', (event, arg) => {
    if (iliasApi !== null) {
      iliasApi.getCurrentEntries()
        .then(a => event.sender.send('render-elements-reply', a))
        .catch(console.error)
    } else {
      console.error('IliasAPI is null!')
    }
  })
  .on('get-cache', (event, arg) => {
    if (iliasApi !== null) {
      const cache = iliasApi.getCache()
      console.log('Main >> Cached entries >>', cache.length)
      event.sender.send('cached-entries', cache)
    } else {
      console.error('IliasAPI is null!')
    }
  })
  .on('getVersion', (event, arg) => {
    event.sender.send('version', app.getVersion())
  })
  .on('getName', (event, arg) => {
    event.sender.send('name', app.getName())
  })
  .on('getSettings', (event, arg) => {
    event.sender.send('settings', Settings.getModifiableSettings())
  })

/**
 * Create the main window
 */
function createWindow () {
  // Setup auto launch
  const autoLaunchEnabled = Settings.getModifiable('autoLaunch')
  const autoLaunch = new AutoLaunch({ name: 'test', isHidden: true })
  autoLaunch.isEnabled().then(isEnabled => {
    // Enable if wanted else disable if enabled
    if (autoLaunchEnabled) {
      if (!isEnabled) { autoLaunch.enable() }
    } else {
      if (isEnabled) { autoLaunch.disable() }
    }
  })

  // Get settings that are used more than once
  const settingsWindowBounds = Settings.getHidden('windowBounds')
  const settingsMinWindowBounds = Settings.getHidden('minWindowBounds')
  const settingsNativeTitleBar = Settings.getModifiable('nativeTitleBar')
  const settingsMinimizeToSystemTray = Settings.getModifiable('minimizeToSystemTray')

  // Icon path
  const iconPath = path.join(__dirname, 'images', 'favicon', 'favicon.ico')

  // Create a BrowserWindow object
  mainWindow = new BrowserWindow({
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
    webPreferences: { nativeWindowOpen: true }
  })

  // Load the 'index.html' file in the window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // If wanted create menu bar
  if (!settingsNativeTitleBar) {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'TODO - Get data from Win10Titlebar',
          click () {
            mainWindow.webContents.send('main-process-to-renderer-message', 'Menu Bar TODO')
          }
        }
      ])
    )
  }

  // If wanted create system tray
  if (settingsMinimizeToSystemTray) {
    const systemTray = new Tray(nativeImage.createFromPath(iconPath))
    systemTray.setToolTip('IliasBuddy')
    systemTray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show App',
        click: function () {
          if (mainWindow.isVisible()) {
            mainWindow.focus()
          } else {
            mainWindow.show()
          }
        } },
      { label: 'Quit',
        click: function () {
          app.quit()
        } }
    ]))
    systemTray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus()
        } else {
          mainWindow.show()
        }
      }
    })
  }

  mainWindow.webContents
    // Prevent the browser window from opening websites in it
    .on('will-navigate', (event, url) => {
      event.preventDefault()
      if (url.startsWith('http:') || url.startsWith('https:')) {
        shell.openExternal(url)
      } else {
        dialog.showErrorBox('Error', 'URL is not safe? - ' + url)
      }
    })
    // TODO React to new windows WHY IS THIS IN HERE?
    .on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
      console.log("mainWindow.webContents.on('new-window'", event, url)
      if (frameName === 'modal') {
        // open window as modal
        event.preventDefault()
        Object.assign(options, {
          modal: true,
          parent: mainWindow,
          width: 100,
          height: 100
        })
        event.newGuest = new BrowserWindow(options)
      }
    })

  // window event listener
  mainWindow
    .on('ready-to-show', () => {
      // If auto launch is enabled minimize the window on start
      if (autoLaunchEnabled) {
        mainWindow.minimize()
      } else {
        // Else show and focus it
        mainWindow.show()
        mainWindow.focus()
      }

      // If dev mode is activated open dev console
      if (Settings.getModifiable('devMode')) {
        mainWindow.webContents.openDevTools()
      }

      // If wanted check for program updates on start
      if (Settings.getModifiable('checkForUpdatesOnStartup')) {
        checkForUpdates()
      }

      // Check for feed updates on start
      if (iliasApi !== null) {
        iliasApi.manageEntries.getCurrentEntries(true)
          .catch(console.error)
      }

      // Start program update cron job if wanted
      if (Settings.getModifiable('checkForUpdatesCronJob')) {
        // Get cron job
        const cronJob = Settings.getModifiable('checkForUpdatesCronJobConfiguration')
        if (!cron.validate(cronJob)) {
          throw Error('Program update cron job is not valid!')
        }
        cronJobProgramUpdates = cron.schedule(cronJob, () => {
          checkForUpdates()
          // DEBUG
          mainWindow.webContents.send('cron-job-debug', 'cronJobProgramUpdates ' + cronJob)
        })
        // DEBUG
        mainWindow.webContents.send('cron-job-debug', 'cronJobProgramUpdates started')
      }

      // Start feed update cron job if wanted
      if (Settings.getModifiable('checkForFeedCronJob')) {
        // Get cron job
        const cronJob = Settings.getModifiable('checkForFeedCronJobConfiguration')
        if (!cron.validate(cronJob)) {
          throw Error('Feed update cron job is not valid!')
        }
        cronJobFeedUpdates = cron.schedule(cronJob, () => {
          if (iliasApi !== null) {
            iliasApi.manageEntries.getCurrentEntries(true).catch(console.error)
          }
          // DEBUG
          mainWindow.webContents.send('cron-job-debug', 'cronJobFeedUpdates ' + cronJob)
        })
        // DEBUG
        mainWindow.webContents.send('cron-job-debug', 'cronJobFeedUpdates started')
      }
    })
    .on('close', () => {
      // Save settings before closing
      saveSettings()
      // Disable active cron jobs
      if (cronJobProgramUpdates !== null) {
        cronJobProgramUpdates.destroy()
      }
      if (cronJobFeedUpdates !== null) {
        cronJobFeedUpdates.destroy()
      }
    })
    .on('closed', () => {
      // Dereference the window object
      mainWindow = null
    })
    .on('minimize', function (event) {
      // If wanted hide the window to the system tray if minimized
      if (settingsMinimizeToSystemTray) {
        event.preventDefault()
        mainWindow.hide()
      }
    })
}

/**
 * Save current settings (+ window size/position) in preferences file
 */
function saveSettings () {
  if (iliasApi !== null) {
    iliasApi.manageEntries.saveCacheFile()
  }
  Settings.setHidden('windowBounds', mainWindow.getBounds())
}

// TODO
function checkForUpdates () {
  VersionChecker.getLatestTagGithub()
    .then(json => {
      console.log('checkForUpdatesOnStartup\n',
        json.tag_name, json.name, json.body, json.id)
    })
    .catch(console.error)
}

// app listeners
app
  // If a second instance is started reopen the first and quit the new one
  .on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  // Electron is loaded)
  .on('ready', createWindow)
  // All windows were closed
  .on('window-all-closed', () => {
    // quit app if all windows are closed
    // macOS: Applications keep their menu bar until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
  })
  .on('activate', () => {
    // macOS: Re-create a window in the app when the dock icon is clicked and there are no other open windows
    if (mainWindow === null) createWindow()
  })
