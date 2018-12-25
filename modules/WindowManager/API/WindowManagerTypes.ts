export namespace WindowManager {
    export interface Window {
        documentId: string;
        id: string;
        options?: WindowOptions;
    }

    export interface WindowOptions {
        cssClassListShow: string[];
        cssClassListHide: string[];
        callbackShow: () => void;
        callbackHide: () => void;
    }

    export interface ShowWindowOptions {
        /**
         * Remove the current shown window from window history
         */
        removeFromHistory?: boolean;
        /**
         * Will discard the shown window if another window is shown after it
         */
        isPopUpWindow?: boolean;
    }
}
