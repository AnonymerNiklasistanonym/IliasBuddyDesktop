export namespace WindowManager {
    export interface Window {
        documentId: string;
        id: string;
        options?: WindowOptions;
    }

    export interface WindowOptions {
        cssClassListShow: string[];
        cssClassListHide: string[];
        callbackShow: VoidFunction;
        callbackHide: VoidFunction;
    }

    export interface ShowWindowOptions {
        removeFromHistory: boolean;
    }
}
