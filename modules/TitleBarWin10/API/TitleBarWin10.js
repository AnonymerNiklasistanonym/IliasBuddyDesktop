const fs = require('fs')
const path = require('path')
const { remote } = require('electron')

class TitleBarWin10 {
  /**
   * Creates an instance of IliasBuddyApi.
   * @param {import('./TitleBarWin10Types').TitleBarWin10.Options} options
   */
  constructor (options) {
    this.options = options

    /**
     * The current window to launch remote commands
     */
    this.mainWindow = remote.getCurrentWindow()
  }
  /**
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
    actionElement.addEventListener('click', action.callback)
    return actionElement
  }
  /**
   * @param {HTMLDivElement} titleBarDiv
   */
  addTitleBar (titleBarDiv) {
    titleBarDiv.classList.remove('title-bar-hidden')

    const stagingElement = document.createDocumentFragment()

    const resizeHandleTop = document.createElement('div')
    resizeHandleTop.classList.add('title-bar-resize-handle', 'title-bar-resize-handle-top')
    stagingElement.appendChild(resizeHandleTop)

    const resizeHandleLeft = document.createElement('div')
    resizeHandleLeft.classList.add('title-bar-resize-handle', 'title-bar-resize-handle-left')
    stagingElement.appendChild(resizeHandleLeft)

    const icon = document.createElement('div')
    icon.id = 'title-bar-icon'
    icon.innerHTML = fs.readFileSync(path.join(__dirname, '../../../images/favicon/favicon.svg')).toString()
    stagingElement.appendChild(icon)

    const title = document.createElement('div')
    title.id = 'title-bar-title'
    title.innerText = 'IliasBuddyDesktop'
    stagingElement.appendChild(title)

    const actions = document.createElement('div')
    actions.id = 'title-bar-actions'
    if (this.options !== undefined && this.options.actions !== undefined) {
      this.options.actions.forEach(action => { actions.appendChild(this.addAction(action)) })
    }
    actions.appendChild(this.addAction({
      alt: 'minimize',
      id: 'title-bar-action-minimize',
      svgFiles: [{ fileName: path.join(__dirname, '../icons/minimize.svg') }],
      callback: () => {}
    }))
    actions.appendChild(this.addAction({
      alt: 'resize',
      id: 'title-bar-action-resize',
      svgFiles: [{ fileName: path.join(__dirname, '../icons/maximize.svg'), id: 'title-bar-action-resize-maximize-icon' },
        { fileName: path.join(__dirname, '../icons/restore.svg'), id: 'title-bar-action-resize-restore-icon' }],
      callback: () => {}
    }))
    actions.appendChild(this.addAction({
      alt: 'close',
      id: 'title-bar-action-close',
      svgFiles: [{ fileName: path.join(__dirname, '../icons/close.svg') }],
      callback: () => {}
    }))
    stagingElement.appendChild(actions)

    titleBarDiv.appendChild(stagingElement)

    const callbacksExist = this.options !== undefined && this.options.defaultCallbacks !== undefined
    this.defaultClickActions(callbacksExist ? this.options.defaultCallbacks : undefined)
    this.electronWindowListener()
  }
  /**
   * @param {HTMLDivElement} titleBarDiv
   */
  removeTitleBar (titleBarDiv) {
    titleBarDiv.classList.add('title-bar-hidden')
    while (titleBarDiv.firstChild) {
      titleBarDiv.removeChild(titleBarDiv.firstChild)
    }
  }
  defaultClickActions (defaultCallbacks) {
    const titleBarMinimize = document.getElementById('title-bar-action-minimize')
    const titleBarResize = document.getElementById('title-bar-action-resize')
    const titleBarClose = document.getElementById('title-bar-action-close')

    titleBarMinimize.addEventListener('click', () => {
      if (defaultCallbacks !== undefined && defaultCallbacks.minimize !== undefined) {
        defaultCallbacks.minimize()
      }
      this.mainWindow.minimize()
    })
    titleBarResize.addEventListener('click', () => {
      if (this.mainWindow.isMaximized()) {
        if (defaultCallbacks !== undefined && defaultCallbacks.restore !== undefined) {
          defaultCallbacks.restore()
        }
        this.mainWindow.restore()
      } else {
        if (defaultCallbacks !== undefined && defaultCallbacks.maximize !== undefined) {
          defaultCallbacks.maximize()
        }
        this.mainWindow.maximize()
      }
    })
    // TODO - If wanted add promises to delay each event even for async exercises
    titleBarClose.addEventListener('click', () => {
      if (defaultCallbacks !== undefined && defaultCallbacks.close !== undefined) {
        defaultCallbacks.close()
      }
      this.mainWindow.close()
    })
  }
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
