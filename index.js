const { ipcRenderer, remote, shell } = require('electron')
const TitleBarWin10 = require('./TitleBarWin10/API/TitleBarWin10')
const WindowManager = require('./WindowManager/API/WindowManager')

const path = require('path')
const Hammer = require('hammerjs')
const Dialogs = require('./Dialogs/API/Dialogs')
const IliasBuddyApi = require('./IliasBuddy/API/IliasBuddyApi')

/**
 * Create Window manager
 */
const windowManager = new WindowManager(
  [
    { documentId: 'main', id: 'main' },
    { documentId: 'info', id: 'info' },
    { documentId: 'settings', id: 'settings' }
  ],
  'main'
)

/**
 * Create title bar
 */
const titleBarWin10 = new TitleBarWin10({ actions: [{
  alt: 'settings',
  id: 'title-bar-action-settings',
  svgFiles: [{ fileName: path.join(__dirname, 'images', 'title-bar', 'settings.svg') }],
  callback: () => toggleScreen('settings')
}, {
  alt: 'info',
  id: 'title-bar-action-info',
  svgFiles: [{ fileName: path.join(__dirname, 'images', 'title-bar', 'info.svg') }],
  callback: () => toggleScreen('info')
}],
defaultCallbacks: {
  minimize: () => { console.log('minimize') },
  maximize: () => { console.log('maximize') },
  restore: () => { console.log('restore') },
  close: () => { console.log('close') }
} })
titleBarWin10.addTitleBar(document.querySelector('div#title-bar'))

let infoToggled = false
let settingsToggled = false
/**
 * @param {string} screen
 */
function toggleScreen (screen) {
  if (screen === 'settings') {
    if (settingsToggled) {
      settingsToggled = false
      return windowManager.showPreviousWindow({ removeFromHistory: true })
    } else {
      settingsToggled = true
    }
  } else if (screen === 'info') {
    if (infoToggled) {
      infoToggled = false
      return windowManager.showPreviousWindow({ removeFromHistory: true })
    } else {
      infoToggled = true
    }
  } else {
    throw Error('WTF')
  }
  windowManager.showWindow(screen)
}

/**
 * Dialog object - controls popup dialogs
 */
/*
Dialogs.question('Question', () => {
  console.log('OK')
  Dialogs.toast('Title', 'Info', () => console.log('Callback'))
}, () => console.log('CANCEL'))
*/

/**
 * The current window to launch remote commands
 */
const mainWindow = remote.getCurrentWindow()
// mainWindow.webContents.openDevTools()

/**
 * Hammer 'object' - gesture listener
 */
const hammer = new Hammer(document.body)
const pan = new Hammer.Pan()
hammer
  .on('panright', leftAnimation)
  .on('panleft', rightAnimation)
  .add(pan)
/**
 * Inter-process-communication
 */
ipcRenderer.send('render-process-to-main-message', 'Hello from index.js to main.js')
ipcRenderer.on('new-entries', (event, arg) => {
  updateIliasEntries(arg)
})

/**
 * Create iliasEntries list
 */
createIliasEntries([])
ipcRenderer.send('get-cache')
ipcRenderer.on('cached-entries', (event, arg) => {
  updateIliasEntries(arg, false)
})

function createIliasEntries (iliasEntries) {
  console.log('Create Ilias Entries')
  const list = document.createElement('ul')
  list.id = 'ilias-entries'
  document.getElementById('main').appendChild(list)
}
function updateIliasEntries (newEntries, notification = true) {
  console.log('Update Ilias Entries', newEntries)

  const list = document.getElementById('ilias-entries')
  IliasBuddyApi.renderEntriesHtml(newEntries).map(element => { list.appendChild(element) })

  if (notification) {
    Dialogs.toast('New entries', newEntries.length + ' entries are new', () => {})
  }
}

/**
 * Open link in external browser (for now)
 * @param {string} url
 */
function openExternal (url) {
  shell.openExternal(url)
}

/**
 * Keyboard input listener
 */
document.addEventListener('keypress', e => {
  switch (e.which) {
    case 122: // F11 - Fullscreen
      mainWindow.setFullScreen(!mainWindow.isFullScreen())
      break
  }
})
document.addEventListener('keydown', e => {
  switch (e.which) {
    case 116: // F5 - reload app
      mainWindow.reload()
      break
    case 123: // F12 - open dev tools
      mainWindow.webContents.isDevToolsOpened() ? mainWindow.webContents.closeDevTools() : mainWindow.webContents.openDevTools()
      break
    case 37: // <-  - Screen switch left
      leftAnimation()
      // windowManager.showLeftWindow()
      break
    case 39: // -> - Screen switch right
      rightAnimation()
      // windowManager.showRightWindow()
      break
  }
})
let slideAnimationActive = false
function hammerGestureHelper (callback) {
  if (slideAnimationActive) {
    return
  }
  slideAnimationActive = true
  callback()
  setTimeout(() => { slideAnimationActive = false }, 1000)
}
function leftAnimation () {
  hammerGestureHelper(() => toggleScreen('info'))
}
function rightAnimation () {
  hammerGestureHelper(() => toggleScreen('settings'))
}

// TODO App info/settings manager
// TODO Rss feed manager (bg checker with notifications)
