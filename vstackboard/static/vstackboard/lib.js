import API from "./api.js";

export class Message {
    constructor() {
        this.info = function (msg, timeout = 5) {
            VuetifyMessageSnackbar.Notify.topRight().timeout(timeout * 1000).info(msg);
        };
        this.success = function (msg, timeout = 5) {
            VuetifyMessageSnackbar.Notify.topRight().timeout(timeout * 1000).success(msg);
        };
        this.error = function (msg, timeout = 5) {
            VuetifyMessageSnackbar.Notify.topRight().timeout(timeout * 1000).error(msg)
        };
    }
}

export class Alert {
    constructor() {
        this.info = function (msg, timeout = 5) {
            VuetifyMessageSnackbar.Notify.top().timeout(timeout * 1000).info(msg);
        };
        this.success = function (msg, timeout = 5) {
            VuetifyMessageSnackbar.Notify.top().timeout(timeout * 1000).success(msg);
        };
        this.error = function (msg, timeout = 5) {
            VuetifyMessageSnackbar.Notify.top().timeout(timeout * 1000).error(msg)
        };
    }
}

export class Utils {
    static nowFormat() {
        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate()
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${date.getFullYear()}${month >= 10 ? month : '0' + month}${day >= 10 ? day : '0' + day}-` +
            `${hours >= 10 ? hours : '0' + hours}:${minutes >= 0 ? minutes : '0' + minutes}:${seconds >= 0 ? seconds : '0' + seconds}`;
    }
    static checkServerStatus(server_id) {
        API.server.detail({ id: server_id }).then(resp => {
            let status = resp.data.server.status;
            if (status == 'active') {
                MESSAGE.success(`实例 ${server_id} 创建成功`);
                return;
            } else if (status == 'error') {
                MESSAGE.error(`卷 ${volume_id} 创建成功`);
                this.volume.volumeTable.refresh();
                return;
            };
        });
    }
    static getRandomName(prefix = null) {
        let name = this.nowFormat()
        return prefix ? `${prefix}-${name}` : name;
    }
    static checkVolumeStatus(volume_id) {
        API.volume.show(volume_id).then(resp => {
            let status = resp.data.volume.status;
            if (status == 'available') {
                MESSAGE.success(`卷 ${volume_id} 创建成功`);
                volumeTable.refresh()
                return;
            } else if (status == 'error') {
                MESSAGE.error(`卷 ${volume_id} 创建失败`);
                volume.volumeTable.refresh();
                return;
            };
            setTimeout(function () {
                Utils.checkVolumeStatus(volume_id)
            }, 5 * 1000)
        });
    }
    static checkVolumeAttached(volume_id){
        API.volume.show(volume_id).then(resp => {
            let status = resp.data.volume.status;
            if (status == 'in-use') {
                MESSAGE.success(`卷 ${volume_id} 挂载成功`);
                return;
            } else if (status == 'error') {
                MESSAGE.error(`卷 ${volume_id} 挂载失败`);
                return;
            };
            setTimeout(function () {
                Utils.checkVolumeAttached(volume_id)
            }, 3 * 1000)
        });
    }
    static checkVolumeDetached(volume_id){
        API.volume.show(volume_id).then(resp => {
            let status = resp.data.volume.status;
            if (status == 'available') {
                MESSAGE.success(`卷 ${volume_id} 卸载成功`);
                return;
            } else if (status == 'error') {
                MESSAGE.error(`卷 ${volume_id} 卸载失败`);
                return;
            };
            setTimeout(function () {
                Utils.checkVolumeDetached(volume_id)
            }, 5 * 1000)
        });
    }
    static humanRam(size){
        if ( size < 1024 ) {
            return `${size}MB`
        }
        return `${(size / 1024).toFixed(0)}GB`
    }
}

export const MESSAGE = new Message();
export const ALERT = new Alert();
