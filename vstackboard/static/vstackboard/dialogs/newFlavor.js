import Dialog from './_base.js'
import {Utils} from '../lib.js'

export class NewFlavorDialog extends Dialog {
    constructor() {
        super({
            id: '', name: '', ram: 2, vcpu: 1, disk: 0, isPublic: true, extrasContent: '',
            extras: [], newKey: '', newValue: ''
        })
        this.ramValues = [256];
        for (var i = 1; i <= 10; i++) {
            this.ramValues.push(this.ramValues[i - 1] * 2)
        }
        this.ramLabels = this.getRamLabels();
    }
    getRamLabels() {
        let labels = []
        this.ramValues.forEach(item => {
            labels.push(Utils.humanRam(item));
        })
        return labels
    }
    getRam() {
        return this.ramValues[this.params.ram];
    }
    commit() {
        if (!this.params.id || !this.params.name) {
            ALERT.error(`规格ID规格和名字不能为空`, 2);
            return;
        }
        let extraSpcs = this.checkExtras();
        if (typeof (extraSpcs) == 'undefined') {
            return;
        }

        API.flavor.create({
            id: this.params.id,
            name: this.params.name,
            ram: this.getRam(),
            vcpus: this.params.vcpu,
            disk: this.params.disk,
            'os-flavor-access:is_public': this.params.isPublic,
        }).then(resp => {
            let flavor = resp.data.flavor;
            MESSAGE.success(`规格 ${this.params.name} 创建成功`);
            if (extraSpcs && Object.keys(extraSpcs).length >= 1) {
                API.flavor.updateExtras(flavor.id, extraSpcs).then(resp2 => {
                    MESSAGE.success(`规格 ${this.params.name} 属性设置成功`);
                    flavorTable.refresh();
                    this.hide()
                });
            } else {
                flavorTable.refresh();
                this.hide()
            }
        })
    }
    checkExtras() {
        let extras = {};
        let extraLines = this.params.extrasContent.split('\n');
        for (var i = 0; i < extraLines.length; i++) {
            let line = extraLines[i];
            if (line.trim() == '') { continue; }
            let kv = line.split('=');
            if (kv.length != 2) {
                ALERT.error(`输入内容有误: ${line}`)
                return;
            }
            let key = kv[0].trim();
            let value = kv[1].trim();
            if (key == '' || value == '') {
                ALERT.error(`输入内容有误: ${line}`)
                return;
            }
            extras[key] = value;
        }
        return extras;
    }
}