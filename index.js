const { ipcRenderer, remote, shell } = require('electron')
const path = require('path')
const TitleBarWin10 = require('./modules/TitleBarWin10/API/TitleBarWin10')
const WindowManager = require('./modules/WindowManager/API/WindowManager')
const Dialogs = require('./modules/Dialogs/API/Dialogs')

/**
 * Create Window manager
 */
const windowManager = new WindowManager(
  [
    { documentId: 'main', id: 'main' },
    { documentId: 'info', id: 'info' },
    { documentId: 'welcome', id: 'welcome' },
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

// TODO Fix window manager or this method
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

// TODO Add later if there is a use case
/**
 * Hammer 'object' - gesture listener
 */
/*
const hammer = new Hammer(document.body)
const pan = new Hammer.Pan()
hammer
  .on('panright', leftAnimation)
  .on('panleft', rightAnimation)
  .add(pan)
*/

/**
 * Inter-process-communication
 */
ipcRenderer.send('render-process-to-main-message', 'Hello from index.js to main.js')
ipcRenderer.on('main-process-to-renderer-message', (event, arg) => {
  console.log('Message:', arg)
})
ipcRenderer.on('new-entries', (event, arg) => {
  updateIliasEntries(arg, true)
})

// TODO react to wrong login and open Welcome page with input for all credentials
/*
 * Check if a login exists
 */
ipcRenderer.send('ilias-login-check')
ipcRenderer.on('ilias-login-check-answer', (event, arg) => {
  console.error('ilias-login-check-answer:', arg)
  if (!arg) {
    windowManager.showWindow('welcome')
    ipcRenderer.send('show-and-focus-window')
  }
})

/**
 * Create iliasEntries list
 */
createIliasEntries([])
ipcRenderer.send('get-cache')
ipcRenderer.on('cached-entries', (event, arg) => {
  updateIliasEntries(arg, false)
})
ipcRenderer.on('cron-job-debug', (event, arg) => {
  console.log('cron-job-debug', arg)
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
  newEntries.map(a => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = a
    list.insertBefore(wrapper.firstChild, list.firstChild)
  })

  if (notification) {
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
 * Keyboard input listener
 */
document.addEventListener('keydown', e => {
  console.log('aha3', e)
  switch (e.which) {
    case 122: // F11 - Fullscreen
      console.log('aha', mainWindow.isFullScreen())
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

ipcRenderer.send('getSettings')
ipcRenderer.send('getVersion')
ipcRenderer.send('getName')

ipcRenderer
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

// TODO Implementation of settings update
const saveChangesButton = document.getElementById('saveChanges')
saveChangesButton.addEventListener('click', a => {
  const list = document.getElementById('settings_entries')
  console.log(list.childNodes.forEach(a => console.log(a.childNodes)))
  console.log(list.querySelectorAll('input').forEach(a => {
    ipcRenderer.send('testSetSettings', {
      type: a.type,
      id: a.name.replace('settings-value-name-', ''),
      value: a.type === 'checkbox' ? a.checked : a.value
    })
  }))
})

ipcRenderer
  .on('settings-set-answer', /**
     * @param {{ id: string, documentId: string, type: string, value: any, restart: boolean }} arg
     */
    (event, arg) => {
      const element = document.getElementById(arg.documentId)
      switch (arg.type) {
        case 'toggle':
          element.checked = arg.value
          break
        case 'text':
        case 'password':
          element.value = arg.value
          break
      }
      if (arg.restart) {
        Dialogs.question('To see the changes the app needs to restart. Do you want to restart immediately?', () => {
          ipcRenderer.send('relaunch', { screenId: windowManager.getCurrentWindow() })
        })
      }
      console.log('settings-set-answer', arg)
    })
  .on('settings-reset-answer', /**
     * @param {{ id: string, documentId: string, type: string, defaultValue: any }} arg
     */
    (event, arg) => {
      const element = document.getElementById(arg.documentId)
      switch (arg.type) {
        case 'toggle':
          element.checked = arg.defaultValue
          break
        case 'text':
        case 'password':
          element.value = arg.defaultValue
          break
      }
      console.log('settings-reset-answer', arg)
    })

function setSettings (infoObject, value) {
  ipcRenderer.send('settings-set', { ...infoObject, value })
}

function resetSettings (infoObject) {
  ipcRenderer.send('settings-reset', { ...infoObject })
}

ipcRenderer.on('open-window', (event, arg) => {
  console.log('open-window', arg)
  windowManager.showWindow(arg.screenId)
})
