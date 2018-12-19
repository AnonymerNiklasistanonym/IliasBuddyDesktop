export interface ModifiableSettingsWithValue {
    id: string;
    info: {
        name: string;
        description: string;
    };
    type: 'toggle'|'text'|'password';
    valueDefault: any;
    value: any;
}
