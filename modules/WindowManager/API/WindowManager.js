/**
 * Window Manager
 */
class WindowManager {
  /**
   * Creates an instance of WindowManager
   * @param {import('./WindowManagerTypes').WindowManager.Window[]} windowList List of all initial known windows
   * @param {string} startupWindowId Startup window id (main)
   */
  constructor (windowList, startupWindowId) {
    /**
     * Registered windows
     * @type {import('./WindowManagerTypes').WindowManager.Window[]}
     */
    this.registeredWindows = []
    /**
     * Windows that are currently open
     * @type {string[]}
     */
    this.openWindowsStack = []
    // Register windows from the windowList
    windowList.forEach(this.registerWindow.bind(this))
    // Show startup (main) window
    this.showWindow(startupWindowId)
    this.fullScreen = false
    this.removeOpenPopUpWindow = false
  }
  /**
   * @param {boolean} [on]
   */
  toggleFullScreen (on) {
    if (on !== undefined) {
      this.fullScreen = on
    } else {
      this.fullScreen = !this.fullScreen
    }
    if (this.fullScreen) {
      this.registeredWindows.forEach(a => document.getElementById(a.documentId).classList.add('window-manager-screen-full-screen'))
    } else {
      this.registeredWindows.forEach(a => document.getElementById(a.documentId).classList.remove('window-manager-screen-full-screen'))
    }
  }
  /**
   * Get the name of the current window
   * @returns {string}
   */
  getCurrentWindow () { return this.openWindowsStack[this.openWindowsStack.length - 1] }
  /**
   * Get the stack of open windows
   * @returns {string[]}
   */
  getWindowStack () { return this.openWindowsStack }
  /**
   * Get the index of a registered Window
   * @param {string} id Id of registered window
   * @returns {number}
   */
  getIndexOfRegisteredWindow (id) {
    if (id === undefined) { throw Error('Window id was undefined') }
    return this.registeredWindows.findIndex(a => a.id === id)
  }
  /**
   * Show a window
   * @param {string} showNewWindowId
   * @param {import('./WindowManagerTypes').WindowManager.ShowWindowOptions} [options]
   */
  showWindow (showNewWindowId, options) {
    let newWindowIndex = this.getIndexOfRegisteredWindow(showNewWindowId)
    if (newWindowIndex === -1) {
      throw Error('New window "' + showNewWindowId + '" is not registered!')
    }

    // Show window GUI
    if (this.getCurrentWindow() === undefined) {
      // No previous window, nothing to do
    } else {
      // Hide previous window
      this.hideWindowTransition(this.registeredWindows[this.getIndexOfRegisteredWindow(this.getCurrentWindow())].documentId)

      // Remove the old window if it's a popup window
      if (this.removeOpenPopUpWindow) {
        this.openWindowsStack.pop()
        this.removeOpenPopUpWindow = false
      }

      // Check further options
      if (options !== undefined) {
        // If this is true remove current window from window history
        if (options.removeFromHistory !== undefined && options.removeFromHistory) {
          // Check first if this window is not a popup window because it's already removed
          if (!this.removeOpenPopUpWindow) {
            this.openWindowsStack.pop()
          }
        }
        // If this is true remove this window when a new window is shown
        if (options.isPopUpWindow !== undefined && options.isPopUpWindow) {
          this.removeOpenPopUpWindow = true
        }
      }
    }

    const registeredWindow = this.registeredWindows[newWindowIndex]
    this.showWindowTransition(registeredWindow.documentId)
    // Remove current window from open window stack history
    this.openWindowsStack = this.openWindowsStack.filter(id => id !== showNewWindowId)
    // Add window to open window stack
    this.openWindowsStack.push(showNewWindowId)
  }
  /**
   * @param {import('./WindowManagerTypes').WindowManager.ShowWindowOptions} [options]
   */
  showPreviousWindow (options) {
    // Only do this if there is a previous window
    if (this.openWindowsStack.length >= 2) {
      this.showWindow(this.openWindowsStack[this.openWindowsStack.length - 2], options)
    }
  }
  /**
   * Register a window
   * @param {import('./WindowManagerTypes').WindowManager.Window} window
   */
  registerWindow (window) {
    if (window === undefined) { throw Error('Window was undefined') }
    if (window.documentId === undefined) { throw Error('Window.documentId was undefined') }
    if (window.id === undefined) { throw Error('Window.id was undefined') }
    if (document.getElementById(window.documentId) === null) { throw Error('Window.documentId was not found') }

    // Initial window hide
    this.hideWindowTransition(window.documentId)
    // Register window
    this.registeredWindows.push(window)
  }
  /**
   * Hide a window [GUI-DOM]
   * @param {string} documentId
   */
  hideWindowTransition (documentId) {
    if (documentId === undefined) { throw Error('elementId was undefined') }
    const windowObject = document.getElementById(documentId)
    if (windowObject === null) { throw Error('elementId was not found') }

    // Add classes to hide window
    windowObject.classList.add('window-manager-screen', 'window-manager-screen-hide')
  }
  /**
   * Show a window [GUI-DOM]
   * @param {string} documentId
   */
  showWindowTransition (documentId) {
    if (documentId === undefined) { throw Error('elementId was undefined') }
    const windowObject = document.getElementById(documentId)
    if (windowObject === null) { throw Error('elementId was not found') }

    // Remove classes to show window
    windowObject.classList.remove('window-manager-screen-hide')
  }
}

module.exports = WindowManager
