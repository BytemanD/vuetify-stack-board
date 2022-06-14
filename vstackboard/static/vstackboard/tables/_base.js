import { MESSAGE } from "../lib.js";

class DataTable {
    constructor(headers, api, bodyKey = null, name='') {
        this.headers = headers;
        this.api = api;
        this.bodyKey = bodyKey;
        this.name = name;
        this.itemsPerPage = 10;
        this.search = '';
        this.items = [];
        this.statistics = {};
        this.selected = []
    }
    deleteSelected() {
        let self = this;
        if (this.selected.length == 0){
            return;
        }
        MESSAGE.info(`${this.name} 删除中`)
        this.selected.forEach(item => {
            self.api.delete(item.id).then(resp => {
                self.checkDeleted(item.id);
            });
        });
        this.refresh();
        this.resetSelected();
    }
    checkDeleted(id) {
        let self = this;
        this.api.list({ id: id }).then(resp => {
            if (resp.data[self.bodyKey].length >= 1) {
                setTimeout(function () {
                    self.checkDeleted(id)
                }, 5 * 1000)
            } else {
                MESSAGE.success(`${self.name} ${id} 删除成功`, 2);
                self.refresh();
            }
        });
    }
    resetSelected() {
        this.selected = [];
    }

    refresh(filters={}) {
        let result = null
        if (this.api.detail) {
            result = this.api.detail(filters);
        } else {
            result = this.api.list(filters)
        }
        result.then(resp => {
            this.items = this.bodyKey ? resp.data[this.bodyKey] : resp.data;
        })
        return result;
    };
}

export default DataTable;