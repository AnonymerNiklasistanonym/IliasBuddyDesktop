/**
 * Types for the TitleBarWin10 API
 */
export namespace TitleBarWin10 {
  /**
   * Constructor options for creation of title bar
   */
  export interface Options {
    /**
     * The default window callbacks (maximize, minimize, close, ...)
     */
    defaultCallbacks?: OptionDefaultCallbacks;
    /**
     * Custom actions
     */
    actions?: OptionAction[];
    /**
     * Display app name
     */
    appName?: string;
    /**
     * Display app icon
     */
    appIconPath?: string;
    /**
     * Custom menu
     */
    menu?: OptionMenu[];
  }
  /**
   * List of default callbacks
   */
  export interface OptionDefaultCallbacks {
    /**
     * Callback: Window is minimized
     */
    minimize?: Promise<void>;
    /**
     * Callback: Window is maximized
     */
    maximize?: Promise<void>;
    /**
     * Callback: Window is restored from minimize
     */
    restore?: Promise<void>;
    /**
     * Callback: Window is closed
     */
    close?: Promise<void>;
  }
  /**
   * Custom action object
   */
  export interface OptionAction {
    /**
     * Hover text of this action
     */
    alt?: string;
    /**
     * Class list of the object to be created
     */
    classList?: string[];
    /**
     * ID of the object to be created
     */
    id?: string;
    /**
     * List of SVG files that should be created
     * (a list so that the user can hide/show them like he wants to)
     */
    svgFiles: OptionSvgFile[];
    /**
     * On-click callback
     */
    onClickCallback: () => void;
  }
  /**
   * Custom menu object
   */
  export interface OptionMenu {
    /**
     * Hover text of this action
     */
    text: string;
    /**
     * Class list of the object to be created
     */
    classList?: string[];
    /**
     * ID of the object to be created
     */
    id?: string;
    /**
     * On-click callback
     */
    onClickCallback: () => void;
  }
  /**
   * SVG file options
   */
  export interface OptionSvgFile {
    /**
     * List of classes that should be added to the SVG image file to be created
     */
    classList?: string[];
    /**
     * File path to SVG image file
     */
    fileName: string;
    /**
     * Id for the SVG image file to be created
     */
    id?: string;
  }
}
