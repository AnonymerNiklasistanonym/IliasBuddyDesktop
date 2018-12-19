export interface DefaultSettingsJson {
    settings: {
        hidden: [
            {
                id: string;
                valueDefault: any;
            }
        ];
        modifiable: ModifiableSettings[];
    };
    version: number;
}

export interface ModifiableSettings {
    id: string;
    info: {
        name: string;
        description: string;
    };
    type: "toggle" | "text" | "password";
    valueDefault: any;
}

export interface ModifiableSettingsWithValue {
    id: string;
    info: {
        name: string;
        description: string;
    };
    type: "toggle" | "text" | "password";
    valueDefault: any;
    value: any;
}

export interface LocalSettingsJson {
    settings?: {
        hidden?: [
            {
                id: string;
                value: any;
            }
        ];
        modifiable?: [
            {
                id: string;
                value: any;
            }
        ]
    };
    version?: number;
}
