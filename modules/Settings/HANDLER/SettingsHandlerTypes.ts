export interface DefaultSettingsJson {
    settings: {
        hidden: [
            {
                id: string;
                valueDefault: any;
            }
        ];
        modifiable: [
            {
                id: string;
                info: {
                    name: string;
                    description: string;
                };
                type: string;
                valueDefault: any;
            }
        ]
    };
    version: number;
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
