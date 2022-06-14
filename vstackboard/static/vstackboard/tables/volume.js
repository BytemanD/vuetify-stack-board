import DataTable from "./_base.js";
import API from "../api.js";

class VolumeDataTable extends DataTable{
    constructor() {
        super([{ text: '名字', value: 'name' },
               { text: '状态', value: 'status' },
               { text: '大小', value: 'size' },
               { text: '可启动', value: 'bootable' },
               { text: '卷类型', value: 'volume_type' },
               { text: '镜像名', value: 'image_name' },
               { text: 'multiattach', value: 'multiattach' },
              ], API.volume, 'volumes', '卷')
    }
}

export default VolumeDataTable;
