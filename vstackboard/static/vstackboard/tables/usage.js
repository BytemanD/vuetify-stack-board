import DataTable from "./_base.js";
import API from "../api.js";

class UsageTable extends DataTable{
    constructor(){
        super([{ text: '租户ID', value: 'tenant_id' },
               { text: '总内存使用', value: 'total_memory_mb_usage' },
               { text: '总cpu使用', value: 'total_vcpus_usage' },
            //    { text: '实例使用', value: 'server_usages' },
              ], API.usage, 'tenant_usages', 'Usage');
        this.start = '';
        this.end = ''
    }
    refresh(){
        console.log(this.start, this.end)
        let params = {detailed: 1};
        if (this.start != this.end) {
            if (this.start){
                params.start = `${this.start}T00:00:00.0`;
            }
            if (this.end){
                params.end = `${this.end}T00:00:00.0`;
            }
        }
        // super.refresh({start: this.start, end: this.end})
        super.refresh(params);
    }
}

export default UsageTable;