import Dialog from './_base.js'
import API from '../api.js';
import { MESSAGE, ALERT, Utils } from '../lib.js'

export class VolumeAttachDialog extends Dialog {
    constructor (){
        super({volumes: [], server: {}, selectedVolumes: []})
    }

    commit(){
        this.params.selectedVolumes.forEach(volume_id => {
            API.server.attachVolume(this.params.server.id, volume_id).then(resp => {
                MESSAGE.info(`卷 ${volume_id} 挂载中 ...`);
                this.hide();
                Utils.checkVolumeAttached(volume_id);
            }).catch(error => {
                MESSAGE.error(`卷 ${volume_id} 挂载失败`);
            });
        });
    }
    open(server){
        this.params.volumes = []
        this.params.selectedVolumes = [];
        API.volume.detail({status: 'available'}).then(resp => {
            this.params.volumes = resp.data.volumes;
        });
        this.params.server = server;
        this.show = true;
    }
}