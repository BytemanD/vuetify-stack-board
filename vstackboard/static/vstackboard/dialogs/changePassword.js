import Dialog from './_base.js'
import API from "../api.js";
import { MESSAGE, ALERT } from '../lib.js'

export class ChangePasswordDialog extends Dialog {
    constructor() {
        super({ password: '', userName: '' });
        this.server = {};
    }
    open(server){
        this.server = server;
        super.open()
    }
    commit() {
        if (!this.params.password.trim()) {
            ALERT.error(`密码不能为空`)
            return;
        }
        API.server.changePassword(this.server.id, this.params.password.trim(),
                                  this.params.userName).then(resp => {
            MESSAGE.success(`${this.server.name} 密码修改成功`)
            this.hide()
        }).catch(error => {
            MESSAGE.error(`${this.server.name} 密码修改失败`)
        });
    }
}
