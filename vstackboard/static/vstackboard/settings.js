// import { I18N } from "../i18n.js";

const NOTIFY_POSITION = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];
// const LANGUAGE = ['en-US', 'zh-CN'];

export class Setting {
    constructor(defaultValue, kwargs = {}) {
        this.default = defaultValue;
        this.choises = kwargs.choises;
        this.value = null;
        this.onChangeCallback = kwargs.onChangeCallback;
    }
    onChange(value){
        if (! this.onChangeCallback){
            return
        }
        this.onChangeCallback(value)
    }
    getValue() {
        return this.value ? this.value : this.default;
    }
}

class NullSetting extends Setting {
    constructor() {
        super(None);
    }
    onChange(value){
        
    }
    getValue() {
        return null;
    }
}


export class Settings {
    constructor() {
        this.show = false;
        this.items = {
            // language: new Setting(navigator.language, { choises: LANGUAGE, onChangeCallback: I18N.setDisplayLang }),
            theme: new Setting('dark', { 'choises': ['light', 'dark'] }),
            navigatorWidth: new Setting('200', { 'choises': ['200', '220', '240', '260', '280', '300'] }),
            messagePosition: new Setting('bottom-right', { 'choises': NOTIFY_POSITION }),
            alertPosition: new Setting('bottom', { 'choises': NOTIFY_POSITION }),
            volumeSizeDefault: new Setting(40, { 'choises': ['1', '10', '20', '30', '40', '50'] }),
            volumeSizeMin: new Setting(40, { 'choises': ['1', '10', '20', '30', '40', '50'] }),
        }
        this.load();
    }
    getItem(item) {
        for (let key in this.items) {
            if (key == item) {
                return this.items[key];
            }
        }
        return NullSetting();
    }
    load() {
        for (let key in this.items) {
            let value = localStorage.getItem(key);
            this.items[key].value = value ? value : this.items[key].default;
        }
    }
    save() {
        for (let key in this.items) {
            localStorage.setItem(key, this.items[key].value);
        }
    }
    reset(){
        for (let key in this.items) {
            localStorage.removeItem(key);
            this.items[key].value = this.items[key].default;
        }
    }
}

export const SETTINGS = new Settings();
