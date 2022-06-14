import DataTable from "./_base.js";
import API from "../api.js";

class FlavorDataTable extends DataTable {
    constructor() {
        super([{ text: 'ID', value: 'id'},
               { text: '名字', value: 'name' },
               { text: '内存', value: 'ram' },
               { text: 'vcpu', value: 'vcpus' },
               { text: '磁盘', value: 'disk' },
               { text: 'swap', value: 'swap' },
               { text: 'ephemeral', value: 'OS-FLV-EXT-DATA:ephemeral' },
              ], API.flavor, 'flavors');
        this.extraSpecsMap = {};
        this.isPublic = true;
    }
    checkDeleted(id) {
        this.api.show(id).then(resp => {
            setTimeout(function () { this.checkDeleted(id) }, 5 * 1000);
        }).catch(error => {
            MESSAGE.success(`规格 ${id} 删除成功`);
            this.refresh();
        });
    }
    refreshExtraSpecs(){
        this.items.forEach(item => {
            if (Object.keys(this.extraSpecsMap).indexOf(item.id) > 0){
                return;
            }
            API.flavor.getExtraSpecs(item.id).then(resp => {
                Vue.set(this.extraSpecsMap, item.id, resp.data.extra_specs)
            })
        })
    }
    refresh(){
        return super.refresh({is_public: this.isPublic}).then(resp => {
            this.refreshExtraSpecs()
        })
    }
}

export default FlavorDataTable;
