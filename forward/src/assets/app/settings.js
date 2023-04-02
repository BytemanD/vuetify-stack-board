import I18N from "./i18n";
import { Notify } from "vuetify-message-snackbar";

const NOTIFY_POSITION = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];
const LANGUAGE = ['en-US', 'zh-CN'];

class Setting {
    constructor(defaultValue, kwargs = {}) {
        this.type = String;
        this.default = defaultValue;
        this.choises = kwargs.choises;
        this.value = null;
        this.onChangeCallback = kwargs.onChangeCallback;
        this.message = kwargs.message;
    }
    onChange(value) {
        if (!this.onChangeCallback) {
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
        super('');
    }
    onChange() {

    }
    getValue() {
        return null;
    }
}
class BooleanSetting extends Setting {
    constructor(defaultValue, kwargs={}) {
        super(defaultValue, kwargs);
        this.type = Boolean;
    }
}
class NumberSetting extends Setting {
    constructor(defaultValue, kwargs = {}) {
        super(defaultValue, kwargs);
        this.type = Number;
    }
}

export class SettingGroup {
    constructor(name, items = {}) {
        this.name = name;
        this.items = items || {};
    }
    getItem(item) {
        if (Object.hasOwn(this.items, item)) {
            return this.items[item];
        }
        return NullSetting();
    }
    setItem(item, value) {
        if (Object.hasOwn(this.items, item)) {
            this.items[item].value = value;
            this.save();
        } else {
            console.error(`配置 ${item} 不存在。`)
        }
    }
    load() {
        for (let key in this.items) {
            let value = localStorage.getItem(key);
            if (value)
                if (this.items[key].type == Boolean){
                    value = value == 'true';
                } else if (this.items[key].type == Number){
                    value = Number(value);
                }
            this.items[key].value = value == null ? this.items[key].default : value;
        }
    }
    save(item = null) {
        for (let key in this.items) {
            if (item == null || Object.hasOwn(this.items, item)) {
                localStorage.setItem(key, this.items[key].value);
            }
        }
    }
    reset() {
        for (let key in this.items) {
            localStorage.removeItem(key);
            this.items[key].value = this.items[key].default;
        }
    }
}

const refreshAfterChanged = I18N.t('refreshAfterChanged');

export class AppSettings {
    constructor() {
        this.ui = new SettingGroup(
            I18N.t('uiSettings'),
            {
                language: new Setting(navigator.language, { choises: LANGUAGE, onChangeCallback: I18N.setDisplayLang, message: refreshAfterChanged }),
                themeDark: new BooleanSetting(false, {message: refreshAfterChanged}),
                navigatorWidth: new NumberSetting(200, { choises: [200, 220, 240, 260, 280, 300], message: refreshAfterChanged }),
                messagePosition: new Setting('bottom-right', { choises: NOTIFY_POSITION }),
                alertPosition: new Setting('bottom', { choises: NOTIFY_POSITION }),
            }
        );
        this.openstack = new SettingGroup(
            I18N.t('openstackSettings'),
            {
                defaultRegion: new Setting('RegionOne'),
                volumeSizeDefault: new NumberSetting(40, { 'choises': [1, 10, 20, 30, 40, 50] }),
                volumeSizeMin: new NumberSetting(40, { 'choises': [1, 10, 20, 30, 40, 50] }),
                imageUploadBlockSize: new NumberSetting(10, { 'choises': [1, 5, 10, 20, 40, 80, 160] }),
            }
        )
    }
    save(){
        for(let group in this){
            this[group].save();
        }
        Notify.success('保存成功');
    }
    load(){
        for(let group in this){
            this[group].load();
        }
    }
    reset(){
        for(let group in this){
            this[group].reset();
        }
        Notify.success('重置成功');
    }
}

export default new AppSettings();
