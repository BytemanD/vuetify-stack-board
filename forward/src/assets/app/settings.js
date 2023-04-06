import I18N from "./i18n";
import { MESSAGE } from "./lib";

const NOTIFY_POSITION = ['bottom-right', 'bottom-left', 'bottom-center', 'top-left', 'top-center', 'top-right'];
const LANGUAGE = ['en-US', 'zh-CN'];

class Setting {
    constructor(defaultValue, kwargs = {}) {
        this.type = String;
        this.default = defaultValue;
        this.choises = kwargs.choises;
        this.value = defaultValue;
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
    save(itemKey = null) {
        if (itemKey && Object.hasOwn(this.items, itemKey)){
            localStorage.setItem(itemKey, this.items[itemKey].value);
        } else {
            for (let key in this.items) {
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

export class AppSettings {
    constructor() {
        this.ui = new SettingGroup(
            'uiSettings',
            {
                language: new Setting(navigator.language, { choises: LANGUAGE, onChangeCallback: I18N.setDisplayLang }),
                themeDark: new BooleanSetting(false),
                navigatorWidth: new NumberSetting(200, { choises: [200, 220, 240, 260, 280, 300] }),
                messagePosition: new Setting(NOTIFY_POSITION[0], { choises: NOTIFY_POSITION }),
                consoleLogWidth: new NumberSetting(1000, { choises: [800, 1000, 1200, 1400, 1600] }),
                resourceWarningPercent: new NumberSetting(80, { choises: [50, 60 , 70, 80, 90] }),
            }
        );
        this.openstack = new SettingGroup(
            'openstackSettings',
            {
                defaultRegion: new Setting('RegionOne'),
                bootWithVolume: new BooleanSetting(true),
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
        MESSAGE.success('保存成功');
    }
    load(){
        console.debug('load settings');
        for(let group in this){
            this[group].load();
        }
    }
    reset(){
        for(let group in this){
            this[group].reset();
        }
        MESSAGE.success('重置成功');
    }
}

const SETTINGS = new AppSettings();
SETTINGS.load();

export default SETTINGS;
