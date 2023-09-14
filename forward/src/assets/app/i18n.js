import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const MESSAGES = {
    'en': {
        language: 'language',
        enUS: 'en_US',
        zhCN: 'zh_CN',
        setting: 'setting',
        reset: 'reset',
        save: 'save',
        name: 'name',
        messagePosition: 'message position',
        alertPosition: 'alert position',
        security: 'security',
        region: 'Region',
        theme: "theme",
        themeDark: "dark theme",
        navigatorWidth: 'navigator width',
        refresh: 'refresh',
        cluster: 'cluster',

        status: 'status',
        hostName: 'hostname',
        usedAndTotalMemory: 'used/total Memory(MB)',
        usedAndTotalCPU: 'used/total CPU',
        usedAndTotalDisk: 'used/total disk(GB)',
        ipAddress: 'IP address',
        hypervisorVersion: 'hypervisor version',
        hypervisorType: 'hypervisor type',

        cpu: 'CPU',
        memory: 'memory',
        localDisk: 'local disk',
        disk: 'disk',
        vm: 'VM',
        instance: 'instance',
        instanceNum: 'instance num',
        node: 'node',

        tenantUsage: 'tenant usage',
        last1Day: 'last 1 day',
        last7Days: 'last 7 days',
        last6Monthes: 'last 6 monthes',
        last1Year: 'last 1 year',
        newService: 'new service',
        service: 'service',
        new: 'new',
        workload: 'Workload',
        serverTopology: 'Server Topology',
        // 配置项解释
        uiSettings: 'UI Settings',
        openstackSettings: 'OpenStack Settings',
        defaultRegion: 'Default regoin',
        imageUploadBlockSize: 'Size of image block to upload',
        refreshAfterChanged: 'Please refresh page after changed',
        consoleLogWidth: 'Width of console log dialog',
        resourceWarningPercent: 'Resource warning percent',
        bootWithVolume: 'Boot with volume',
        supportResourceAction: 'Cinder support query resource actions',
        // 实例任务状态
        'scheduling': 'scheduling',
        'block_device_mapping': 'block device mapping',
        'spawning': 'spawing',
        'powering-off': 'powering off',
        'powering-on': 'powering on',
        'pausing': 'pausing',
        'unpausing': 'unpausing',
        'deleting': 'deleting',
        'rebooting': 'rebooting',
        'rebooting_hard': 'hard rebooting',
        'reboot_started': 'reboot started',
        'rebuilding': "rebuilding",
        'resize_prep': 'resize prep',
        'resize_migrating': 'resize migrating',
        'resize_finish': 'resize finish',
        'migrating': 'migrating',
        'networking': 'networking',
        // server actions
        migrate: 'migrate',
        reboot: 'reboot',
        pause: 'pause',
        unpause: 'unpause',
        stop: 'stop',
        start: 'start',

    },
    'zh-CN': {
        language: '语言',
        enUS: '英文',
        zhCN: '简体中文',
        setting: '设置',
        reset: '重置',
        save: '保存',
        name: '名字',
        messagePosition: '消息框显示位置',
        alertPosition: '警告框显示位置',
        volumeSizeDefault: '系统盘默认大小',
        volumeSizeMin: '系统盘最小值',
        security: '安全',
        region: '地区',
        theme: "主题",
        themeDark: "深色主题",
        navigatorWidth: '侧边栏宽度',
        refresh: '刷新',
        cluster: '集群',

        status: '状态',
        hostName: '主机名',
        usedAndTotalMemory: '已用内存/总内存(MB)',
        usedAndTotalCPU: '已用CPU/总CPU',
        usedAndTotalDisk: '已用磁盘/总磁盘空间(GB)',
        ipAddress: 'IP地址',
        hypervisorVersion: '虚拟机化版本',
        hypervisorType: '虚拟化类型',

        cpu: 'CPU',
        memory: '内存',
        localDisk: '本地磁盘',
        disk: '磁盘',
        vm: '虚拟机',
        instance: '实例',
        instanceNum: '虚拟机数量',
        node: '节点',

        tenantUsage: '资源使用情况',
        last1Day: '最近1天',
        last7Days: '最近7天',
        last6Monthes: '最近6个月',
        last1Year: '最近1年',
        newService: '新建服务',
        service: '服务',
        new: '新建',
        workload: '负载',
        serverTopology: '虚拟机拓扑',
        // 配置项解释
        uiSettings: '界面配置',
        openstackSettings: 'OpenStack 配置',
        defaultRegion: '默认地区',
        imageUploadBlockSize: '镜像分块上传的大小',
        refreshAfterChanged: '修改后请刷新页面',
        consoleLogWidth: '控制台日志对话框长度',
        resourceWarningPercent: '资源警告阈值(%)',
        bootWithVolume: '使用云盘创建实例',
        supportResourceAction: 'Cinder支持查询资源操作记录',
        // 实例任务状态
        'scheduling': '调度中',
        'block_device_mapping': '创建系统盘',
        'networking': '创建网络',
        'spawning': '孵化中',
        'powering-off': '关机中',
        'powering-on': '开机中',
        'pausing': '暂停中',
        'unpausing': '取消暂停中',
        'deleting': '删除中',
        'rebooting': '重启中',
        'rebooting_hard': '硬重启中',
        'reboot_started': '开始重启',
        'rebuilding': "重建中",
        'resize_prep': '变更准备中',
        'resize_migrating': '变更迁移中',
        'resize_finish': '变更结束',
        'migrating': '迁移中',

        migrate: '迁移',
        reboot: '重启',
        pause: '暂停',
        unpause: '取消暂停',
        stop: '关机',
        start: '开机',
    },
};

// function getUserSettedLang() {
//     return localStorage.getItem('language');
// }

class I18n extends VueI18n {
    constructor(){
        super({
            locale: localStorage.getItem('language') || navigator.language || 'zh-CN',
            messages: MESSAGES
        });
    }

    setDisplayLang(language) {
        if(language){
            this.locale = language;
            localStorage.setItem('language', this.locale)
        }
    }
}

export default new I18n();
