import Dialog from './_base.js'
import API from "../api.js";
import { MESSAGE, ALERT, Utils } from '../lib.js'

export class VolumeDetachDialog extends Dialog {
    constructor (){
        super({server: {}, selectedVolumes: [], attachments: []})
    }

    open(server){
        this.params.server = server;
        this.params.volumes = []
        this.params.selectedVolumes = [];
        API.server.volumeAttachments(this.params.server.id).then(resp => {
            this.params.attachments = resp.data.volumeAttachments.filter(item => { return item.device != '/dev/vda' });
        });
        this.display();
    }
    commit(){
        this.params.selectedVolumes.forEach(volume_id => {
            API.server.volumeDetach(this.params.server.id, volume_id).then(resp => {
                MESSAGE.info(`卷 ${volume_id} 卸载中 ...`);
                Utils.checkVolumeDetached(volume_id);
                this.hide()
            }).catch(error => {
                MESSAGE.error(`卷 ${volume_id} 卸载失败`);
            });
        });
    }
}