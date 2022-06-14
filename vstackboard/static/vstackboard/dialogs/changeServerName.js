import Dialog from './_base.js'
import API from '../api.js'
import { MESSAGE } from '../lib.js'

export class ChangeServerNameDialog extends Dialog {
    constructor (){ super({newName: '', server: {}})}

    commit(){
        API.server.put(this.params.server.id,
                       {server: {name: this.params.newName}
        }).then(resp => {
            this.hide();
            MESSAGE.success('实例名修改成功');
            this.params.server.name = this.params.newName;
        }).catch(error => {
            console.error(error)
            MESSAGE.error('实例名修改失败');
        })
    }
    open(server){
        this.params.server = server;
        this.params.newName = '';
        this.show = true;
    }
}
