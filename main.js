/**
 * Main script of the electron application
 *
 * @summary handles the app start/close, main process, windows, ...
 * @author AnonymerNiklasistanyonym
 */

/* =====  Imports  ====== */

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const VersionChecker = require('./IliasBuddy/Other/VersionChecker')
const Settings = require('./IliasBuddy/Other/Settings')
const IliasBuddyApi = require('./IliasBuddy/API/IliasBuddyApi')
const AutoLaunch = require('auto-launch')

// TODO: Update checker
// TODO: Settings IPC listener
// TODO: Settings loader (default/saved)

if (!fs.existsSync(path.join(__dirname, 'iliasPrivateRssFeedLogin.json'))) {
  app.quit()
  throw Error('Create the file "iliasPrivateRssFeedLogin.json" with the values\n{ url: string, userName:string, password:string }\nso that the app has access to your private ilias rss feed!')
}

// global variables
var mainWindow = null

// Only one instance of the program should run
if (!app.requestSingleInstanceLock()) app.quit()

// inter process communication listeners
ipcMain
  .on('test-send', (event, arg) => {
    console.log('event:', event)
    console.log('arg:', arg)
  })
  .on('render-elements', (event, arg) => {
    const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'iliasPrivateRssFeedLogin.json')).toString())
    const api = new IliasBuddyApi(credentials.url, credentials.userName, credentials.password)

    api.getCurrentEntries()
      .then(a => event.sender.send('render-elements-reply', a))
      .catch(console.error)
  })

/**
 * Create the main window
 */
function createWindow () {
  dialog.showMessageBox({ message: 'We are ready to take off! :-)"', buttons: ['OK'] })
  let autoLaunch = new AutoLaunch({
    name: 'test',
    isHidden: true
    // path: app.getPath("exe")
  })
  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
      autoLaunch.enable()
      dialog.showMessageBox({ message: 'AutoLaunch enabled.', buttons: ['OK'] })
    } else dialog.showMessageBox({ message: 'AutoLaunch already enabled.', buttons: ['OK'] })
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
      // if page is loaded show window
      mainWindow.show()
      // and focus the window
      mainWindow.focus()
      // and open the dev console
      // mainWindow.webContents.openDevTools()
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
}

/**
 * Save current settings (+ window size/position) in preferences file
 */
function saveSettings () {
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
