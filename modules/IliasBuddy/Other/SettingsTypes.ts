export interface SettingsJson {
    credentials: {
        password: boolean | string;
        url: boolean | string;
        userName: boolean | string;
        hash: boolean | string;
    };
    frame: boolean;
    schedules: {
        feedCheck: {
            cronJob: string;
            enabled: boolean;
            onStart: boolean;
        };
        updateCheck: {
            cronJob: string;
            enabled: boolean;
            onStart: boolean;
        };
    };
    touchGestures: boolean;
    tray: boolean;
    windowBounds: {
        width: number;
        height: number;
        x: number;
        y: number;
    };
}
