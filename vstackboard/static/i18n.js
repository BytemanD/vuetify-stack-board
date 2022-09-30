const MESSAGES = {
    'en': {
        language: 'language',
        enUS: 'en_US',
        zhCN: 'zh_CN',
        setting: 'setting',
        reset: 'reset',
        save: 'save',
        name: 'name',
        messagePosition: 'message position',
        alertPosition: 'alert position',
        security: 'security',
    },
    'zh-CN': {
        language: '语言',
        enUS: '英文',
        zhCN: '简体中文',
        setting: '设置',
        reset: '重置',
        save: '保存',
        name: '名字',
        messagePosition: '消息框显示位置',
        alertPosition: '警告框显示位置',
        security: '安全',
    },
};

function getUserSettedLang() {
    return localStorage.getItem('language');
}

class I18n extends VueI18n {
    constructor(){
        super({locale: localStorage.getItem('language') || navigator.language || 'zh-CN', messages: MESSAGES});
    }

    setDisplayLang(language) {
        if(language){
            this.locale = language;
            localStorage.setItem('language', this.locale)
        };
    }
}

export const I18N = new I18n();


