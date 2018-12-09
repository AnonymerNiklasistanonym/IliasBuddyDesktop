/**
 * Main script of the electron application
 *
 * @summary handles the app start/close, main process, windows, ...
 * @author AnonymerNiklasistanyonym
 */

/* =====  Imports  ====== */

const { app, BrowserWindow, ipcMain, dialog, Tray, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const VersionChecker = require('./IliasBuddy/Other/VersionChecker')
const Settings = require('./IliasBuddy/Other/Settings')
const IliasBuddyApi = require('./IliasBuddy/API/IliasBuddyApi')
const AutoLaunch = require('auto-launch')
const cron = require('node-cron')

// TODO: Use electron dialogs instead of dialog module which is not 100% secure
// TODO: Update checker
// TODO: Settings IPC listener
// TODO: Settings loader (default/saved)

if (!fs.existsSync(path.join(__dirname, 'iliasPrivateRssFeedLogin.json'))) {
  app.quit()
  const tempError = Error('Create the file "iliasPrivateRssFeedLogin.json" with the values \n{ url: string, userName: string, password: string }\n so that the app has access to your private ilias rss feed!')
  dialog.showErrorBox('Temporary Configuration Error', tempError.toString())
  // throw tempError
}

// global variables
/**
 * @type {BrowserWindow}
 */
var mainWindow = null

// Only one instance of the program should run
if (!app.requestSingleInstanceLock()) app.quit()

// IliasApi object hidden from GUI process
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'iliasPrivateRssFeedLogin.json')).toString())
const api = new IliasBuddyApi(credentials.url, credentials.userName, credentials.password, newEntries => {
  console.log('Main >> New entries >>', newEntries.length)
  if (newEntries !== undefined && newEntries.length > 0) {
    mainWindow.webContents.send('new-entries', newEntries)
  }
})

// Start checking for updates
var bgCheckTask = cron.schedule('*/10 * * * * *', () => {
  console.log('Execute every 10 seconds', true)
  api.manageEntries.getCurrentEntries(true).catch(console.error)
})

// inter process communication listeners
ipcMain
  .on('render-process-to-main-message', (event, arg) => {
    console.log('Message:', arg)
  })
  .on('render-elements', (event, arg) => {
    api.getCurrentEntries()
      .then(a => event.sender.send('render-elements-reply', a))
      .catch(console.error)
  })
  .on('get-cache', (event, arg) => {
    const cache = api.getCache()
    console.log('Main >> Cached entries >>', cache.length)
    event.sender.send('cached-entries', cache)
  })

/**
 * Create the main window
 */
function createWindow () {
  let autoLaunch = new AutoLaunch({
    name: 'test',
    isHidden: true
    // path: app.getPath("exe")
  })
  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
      autoLaunch.enable()
      console.log('AutoLaunch enabled.')
      // dialog.showMessageBox({ message: 'AutoLaunch enabled.', buttons: ['OK'] })
    } else {
      console.log('AutoLaunch already enabled.')
      // dialog.showMessageBox({ message: 'AutoLaunch already enabled.', buttons: ['OK'] })
    }
  })
  // get settings
  const settingsWindowBounds = Settings.get('windowBounds')
  const settingsFrame = Settings.get('frame')
  // create a BrowserWindow object
  mainWindow = new BrowserWindow({
    frame: settingsFrame,
    title: app.getName(),
    titleBarStyle: 'hidden', // macOS: buttons are an overlay
    minWidth: 600,
    minHeight: 600,
    width: settingsWindowBounds.width,
    height: settingsWindowBounds.height,
    x: settingsWindowBounds.x,
    y: settingsWindowBounds.y,
    show: false, // do not show the window before content is loaded
    icon: path.join(__dirname, 'images', 'favicon', 'favicon.ico'),
    center: settingsWindowBounds.x === 0 && settingsWindowBounds.y === 0,
    webPreferences: {
      nativeWindowOpen: true
    }
  })
  // load the 'index.html' file in the window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  const systemTray = new Tray('./images/favicon/favicon.ico')
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

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
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
      // DONT:
      // if page is loaded show window
      // mainWindow.show()
      mainWindow.minimize()
      // and focus the window
      // mainWindow.focus()
      // and open the dev console
      mainWindow.webContents.openDevTools()
      // and if settings say so check if a new version is available
      // if (settings.get('checkForNewVersionOnStartup')) checkForNewVersion()
      VersionChecker.getLatestTagGithub()
        .then(json => {
          console.log(json.tag_name, json.name, json.body, json.id)
        })
        .catch(console.error)
    })
    .on('close', saveSettings)
    .on('closed', () => {
      // dereference the window object
      mainWindow = null
    })

  // System Tray integration
  mainWindow.on('minimize', function (event) {
    event.preventDefault()
    mainWindow.hide()
  })
}

/**
 * Save current settings (+ window size/position) in preferences file
 */
function saveSettings () {
  api.manageEntries.saveCacheFile()
  Settings.set('windowBounds', mainWindow.getBounds())
  Settings.save()
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
