import { Utils, ALERT, MESSAGE } from '../lib.js'
import Dialog from './_base.js'
import API from '../api.js'

export class NewEnvDialog extends Dialog {
    constructor() {
        super({
            name: '', authUrl: '', authProject: '', authUser: '',
            authPassword: ''
        })
    }
    commit() {
        if (!this.params.name) { ALERT.error(`环境名不能为空`); return; }

        let data = {name: this.params.name,
                    authUrl: this.params.authUrl,
                    authProject: this.params.authProject,
                    authUser: this.params.authUser,
                    authPassword: this.params.authPassword
        };
        API.env.add(data).then(resp => {
            MESSAGE.success(`环境 ${this.params.name} 添加成功`)
        }).catch(error => {
            MESSAGE.error(`环境 ${this.params.name} 添加失败`)
        })
    }

}
