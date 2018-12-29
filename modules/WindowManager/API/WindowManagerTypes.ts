export namespace WindowManager {
    export interface Window {
        /**
         * HTML element id of window
         */
        documentId: string;
        /**
         * Unique identifier to call the window
         */
        id: string;
        /**
         * Additional window options
         */
        options?: WindowOptions;
    }

    export interface WindowOptions {
        /**
         * CSS tags that the window gets when it's shown
         */
        cssClassListShow: string[];
        /**
         * CSS tags that the window gets when it's hidden
         */
        cssClassListHide: string[];
        /**
         * Callback when the window is shown
         */
        callbackShow: () => void;
        /**
         * Callback when the window is hidden
         */
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
