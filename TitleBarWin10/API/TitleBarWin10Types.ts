export namespace TitleBarWin10 {
  export interface Options {
    defaultCallbacks?: OptionDefaultCallbacks;
    actions?: OptionAction[];
  }
  export interface OptionDefaultCallbacks {
    minimize?: VoidFunction;
    maximize?: VoidFunction;
    restore?: VoidFunction;
    close?: VoidFunction;
  }
  export interface OptionAction {
    id?: string;
    classList?: string[];
    svgFiles: OptionSvgFile[];
    alt?: string;
    callback: VoidFunction;
  }
  export interface OptionSvgFile {
    fileName: string;
    classList?: string[];
    id?: string;
  }
}
