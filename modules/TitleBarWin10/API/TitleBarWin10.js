const fs = require('fs')
const path = require('path')
const { remote } = require('electron')

/**
 * Windows 10 lookalike title bar helper
 */
class TitleBarWin10 {
  /**
   * Creates an instance of IliasBuddyApi.
   * @param {import('./TitleBarWin10Types').TitleBarWin10.Options} options
   */
  constructor (options) {
    /**
     * Custom options like callback listener or custom action buttons
     * @type {import('./TitleBarWin10Types').TitleBarWin10.Options}
     */
    this.options = options
    /**
     * The current window to launch remote commands
     * @type {Electron.BrowserWindow}
     */
    this.mainWindow = remote.getCurrentWindow()

    this.minimizeActionId = 'title-bar-action-minimize'
    this.maximizeActionId = 'title-bar-action-maximize'
    this.resizeActionId = 'title-bar-action-resize'
    this.closeActionId = 'title-bar-action-close'
  }
  /**
   * Add a action to the title bar (like close, minimize, ...)
   * @param {import('./TitleBarWin10Types').TitleBarWin10.OptionAction} action
   * @returns {HTMLDivElement}
   */
  addAction (action) {
    const actionElement = document.createElement('div')
    if (action.id !== undefined) {
      actionElement.id = action.id
    }
    if (action.alt !== undefined) {
      actionElement.setAttribute('alt', action.alt)
    }
    if (action.classList !== undefined) {
      actionElement.classList.add(...action.classList)
    }
    const svgStrings = action.svgFiles.map(svgFile => {
      const svgContent = fs.readFileSync(svgFile.fileName).toString()
      const wrapper = document.createElement('div')
      wrapper.innerHTML = svgContent
      const svgElement = wrapper.firstChild
      if (svgFile.id !== undefined) {
        svgElement.id = svgFile.id
      }
      if (svgFile.classList !== undefined) {
        svgElement.classList.add(...svgFile.classList)
      }
      return svgElement
    })
    svgStrings.forEach(a => { actionElement.appendChild(a) })
    if (action.onClickCallback !== undefined) {
      actionElement.addEventListener('click', action.onClickCallback)
    }
    return actionElement
  }
  /**
   * Add a menu entry to the title bar (Like File, Edit, Help, ...)
   * @param {import('./TitleBarWin10Types').TitleBarWin10.OptionMenu} menu
   * @returns {HTMLDivElement}
   */
  addMenu (menu) {
    const menuElement = document.createElement('div')
    menuElement.innerText = menu.text
    menuElement.setAttribute('alt', menu.text)
    if (menu.id !== undefined) {
      menuElement.id = menu.id
    }
    if (menu.classList !== undefined) {
      menuElement.classList.add(...menu.classList)
    }
    if (menu.onClickCallback !== undefined) {
      menuElement.addEventListener('click', menu.onClickCallback)
    }
    return menuElement
  }
  // TODO Complexity is too high
  /**
   * Add the generated title bar to the given HTML DIV element
   * @param {HTMLDivElement} titleBarDiv
   */
  // tslint:disable-next-line: cyclomatic-complexity
  addTitleBar (titleBarDiv) {
    titleBarDiv.classList.remove('title-bar-hidden')

    const stagingElement = document.createDocumentFragment()

    const resizeHandleTop = document.createElement('div')
    resizeHandleTop.classList.add('title-bar-resize-handle',
      'title-bar-resize-handle-top')
    stagingElement.appendChild(resizeHandleTop)

    const resizeHandleLeft = document.createElement('div')
    resizeHandleLeft.classList.add('title-bar-resize-handle',
      'title-bar-resize-handle-left')
    stagingElement.appendChild(resizeHandleLeft)

    if (this.options !== undefined &&
      this.options.appIconPath !== undefined) {
      const icon = document.createElement('div')
      icon.id = 'title-bar-icon'
      icon.innerHTML = fs.readFileSync(this.options.appIconPath).toString()
      stagingElement.appendChild(icon)
    }

    if (this.options !== undefined &&
      this.options.appName !== undefined) {
      const title = document.createElement('div')
      title.id = 'title-bar-title'
      title.innerText = this.options.appName
      stagingElement.appendChild(title)
    }

    const menu = document.createElement('div')
    menu.id = 'title-bar-menu'
    if (this.options !== undefined && this.options.menu !== undefined) {
      this.options.menu.forEach(menuElement => {
        menu.appendChild(this.addMenu(menuElement))
      })
    }
    stagingElement.appendChild(menu)

    const actions = document.createElement('div')
    actions.id = 'title-bar-actions'
    if (this.options !== undefined && this.options.actions !== undefined) {
      this.options.actions.forEach(action => {
        actions.appendChild(this.addAction(action))
      })
    }
    actions.appendChild(this.addAction({
      alt: 'minimize',
      id: this.minimizeActionId,
      svgFiles: [{ fileName: path.join(__dirname, '../icons/minimize.svg') }]
    }))
    actions.appendChild(this.addAction({
      alt: 'resize',
      id: this.resizeActionId,
      svgFiles: [{
        fileName: path.join(__dirname, '../icons/maximize.svg'),
        id: 'title-bar-action-resize-maximize-icon'
      }, {
        fileName: path.join(__dirname, '../icons/restore.svg'),
        id: 'title-bar-action-resize-restore-icon'
      }]
    }))
    actions.appendChild(this.addAction({
      alt: 'close',
      id: this.closeActionId,
      svgFiles: [{ fileName: path.join(__dirname, '../icons/close.svg') }]
    }))
    stagingElement.appendChild(actions)

    titleBarDiv.appendChild(stagingElement)

    const callbacksExist = this.options !== undefined &&
      this.options.defaultCallbacks !== undefined

    this.defaultClickActions(callbacksExist
      ? this.options.defaultCallbacks : undefined)
    this.electronWindowListener()
  }
  /**
   * Remove title bar from the initial set HTML DIV element
   * @param {HTMLDivElement} titleBarDiv
   */
  removeTitleBar (titleBarDiv) {
    titleBarDiv.classList.add('title-bar-hidden')
    while (titleBarDiv.firstChild) {
      titleBarDiv.removeChild(titleBarDiv.firstChild)
    }
  }
  /**
   * Set default callbacks (close, minimize, ...)
   * @param {import('./TitleBarWin10Types').TitleBarWin10
   * .OptionDefaultCallbacks} defaultCallbacks
   * @memberof TitleBarWin10
   */
  defaultClickActions (defaultCallbacks) {
    const titleBarMinimize = document.getElementById(this.minimizeActionId)
    const titleBarResize = document.getElementById(this.resizeActionId)
    const titleBarClose = document.getElementById(this.closeActionId)

    titleBarMinimize.addEventListener('click', () => {
      if (defaultCallbacks !== undefined &&
          defaultCallbacks.minimize !== undefined) {
        defaultCallbacks.minimize().then(() => {
          this.mainWindow.minimize()
        }).catch(err => {
          console.error(err)
          this.mainWindow.minimize()
        })
      } else {
        this.mainWindow.minimize()
      }
    })
    titleBarResize.addEventListener('click', () => {
      if (this.mainWindow.isMaximized()) {
        if (defaultCallbacks !== undefined &&
            defaultCallbacks.restore !== undefined) {
          defaultCallbacks.restore().then(() => {
            this.mainWindow.restore()
          }).catch(err => {
            console.error(err)
            this.mainWindow.restore()
          })
        } else {
          this.mainWindow.restore()
        }
      } else {
        if (defaultCallbacks !== undefined &&
            defaultCallbacks.maximize !== undefined) {
          defaultCallbacks.maximize().then(() => {
            this.mainWindow.maximize()
          }).catch(err => {
            console.error(err)
            this.mainWindow.maximize()
          })
        } else {
          this.mainWindow.maximize()
        }
      }
    })
    titleBarClose.addEventListener('click', () => {
      if (defaultCallbacks !== undefined &&
          defaultCallbacks.close !== undefined) {
        defaultCallbacks.close().then(() => {
          this.mainWindow.close()
        }).catch(err => {
          console.error(err)
          this.mainWindow.close()
        })
      } else {
        this.mainWindow.close()
      }
    })
  }
  /**
   * Setup listener to electron window actions
   */
  electronWindowListener () {
    const titleBar = document.getElementById('title-bar')
    const titleBarResize = document.getElementById('title-bar-action-resize')
    this.mainWindow
      .on('enter-full-screen', () => {
        titleBar.classList.add('title-bar-full-screen')
      })
      .on('leave-full-screen', () => {
        titleBar.classList.remove('title-bar-full-screen')
      })
      .on('maximize', () => {
        titleBarResize.classList.add('title-bar-action-resize-maximized')
      })
      .on('unmaximize', () => {
        titleBarResize.classList.remove('title-bar-action-resize-maximized')
      })
  }
}

module.exports = TitleBarWin10
