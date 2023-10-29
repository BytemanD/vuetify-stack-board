
import API from "./api.js";
import { CookieContext } from "./context.js";
import notify from "./notify.js";
import SETTINGS from "./settings.js";

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

export class Utils {
    static now(dateObject = null) {

    }
    static nowFormat(dateObject = null) {
        let date = dateObject ? dateObject : new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate()
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${date.getFullYear()}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ` +
            `${hours >= 10 ? hours : '0' + hours}:${minutes >= 10 ? minutes : '0' + minutes}:${seconds >= 10 ? seconds : '0' + seconds}`;
    }
    static parseUTCToLocal(utcString) {
        if (!utcString) {
            return '';
        }
        if (!utcString.endsWith('Z')) {
            utcString += 'Z'
        }
        return Utils.nowFormat(new Date(utcString))
    }
    static getRandomName(prefix = null) {
        let date = this.nowFormat().replaceAll(":", "").replaceAll(" ", "-")
        return prefix ? `${prefix}-${date}` : date;
    }
    static checkVolumeAttached(volume_id) {
        API.volume.show(volume_id).then(resp => {
            let status = resp.data.volume.status;
            if (status == 'in-use') {
                MESSAGE.success(`卷 ${volume_id} 挂载成功`);
                return;
            } else if (status == 'error') {
                MESSAGE.error(`卷 ${volume_id} 挂载失败`);
                return;
            }
            setTimeout(function () {
                Utils.checkVolumeAttached(volume_id)
            }, 3 * 1000)
        });
    }
    static checkVolumeDetached(volume_id) {
        API.volume.show(volume_id).then(resp => {
            let status = resp.data.volume.status;
            if (status == 'available') {
                MESSAGE.success(`卷 ${volume_id} 卸载成功`);
                return;
            } else if (status == 'error') {
                MESSAGE.error(`卷 ${volume_id} 卸载失败`);
                return;
            }
            setTimeout(function () {
                Utils.checkVolumeDetached(volume_id)
            }, 5 * 1000)
        });
    }
    static humanRam(size) {
        if (size < 1024) {
            return `${size} MB`
        }
        return `${(size / 1024).toFixed(0)} GB`
    }
    static humanSize(size) {
        if (size == null) {
            return ''
        } else if (size <= KB) {
            return `${size} B`
        } else if (size <= MB) {
            return `${(size / KB).toFixed(2)} KB`
        } else if (size <= GB) {
            return `${(size / MB).toFixed(2)} MB`
        } else {
            return `${(size / GB).toFixed(2)} GB`
        }
    }
    static sleep(seconds) {
        seconds = (seconds || 0);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, seconds * 1000)
        })
    }
    static copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            let element = document.createElement('input', text)
            element.setAttribute('value', text);
            document.body.appendChild(element)
            element.select();
            document.execCommand('copy');
            document.body.removeAttribute(element);
        }
    }
    static lastDateList(steps, nums) {
        // Get last n list of date
        // e.g. [timestamp1, timestamp2, ...]
        let endDate = new Date();
        let dateList = [];
        for (let i = 0; i < nums; i++) {
            for (let unit in steps) {
                switch (unit) {
                    case 'hour':
                        endDate.setHours(endDate.getHours() - steps.hour);
                        break;
                    case 'month':
                        endDate.setMonth(endDate.getMonth() - steps.month)
                        break;
                    case 'day':
                        endDate.setDate(endDate.getDate() - steps.day);
                        break;
                    case 'year':
                        endDate.setFullYear(endDate.getFullYear() - steps.year);
                        break;
                    default:
                        throw Error(`Invalid step unit ${unit}`);
                }
            }
            dateList.push(endDate.getTime());
        }
        return dateList.reverse();
    }
    static copyContent(content, message = null) {
        Utils.copyToClipboard(content)
        if (message) {
            notify.success(message);
        }
    }
    static isEmpty(value) {
        return !value || value == '' || value == {} || value == [];
    }
    static getNavigationSelectedItem(){
        let localItem = localStorage.getItem('navigationSelectedItem');
        return localItem ? JSON.parse(localItem): null;
    }
    static setNavigationSelectedItem(item){
        if (! item) {
            console.warn('item is null when navigationSelectedItem')
            return
        }
        localStorage.setItem('navigationSelectedItem', JSON.stringify(item));
    }
}

//             error  warning info debug
// logLevels = [0,    1,      2,   3]
export var Level = {
    ERROR: 0,
    WARNING: 1,
    INFO: 2,
    DEBUG: 3,
}

export class Logger {
    constructor(kwargs = {}) {
        this.level = kwargs['level'] || Level.INFO;
    }
    debug(msg) {
        if (this.level < Level.DEBUG) {
            return
        }
        console.debug(new Date().toLocaleString(), 'DEBUG', msg)
    }
    info(msg) {
        if (this.level < Level.INFO) {
            return
        }
        console.info(`${new Date().toLocaleString()} INFO ${msg}`)
    }
    warn(msg) {
        if (this.level < Level.WARNING) {
            return
        }
        console.warn(`${new Date().toLocaleString()} WARN ${msg}`)
    }
    error(msg) {
        console.error(`${new Date().toLocaleString()} ERROR ${msg}`)
        MESSAGE.error(msg)
    }
}

export class ContextLocalStorage {
    constructor() {
        this.context = new CookieContext();
    }
    domain() {
        return `${this.context.getClusterId()}_${this.context.getRegion() || 'default'}`;
    }
    getAll(name) {
        let itemName = `${this.domain()}_${name}`
        LOG.debug(`localStorage get Item ${itemName}`)
        let data = localStorage.getItem(itemName)
        return data ? JSON.parse(data) : {};
    }
    get(name, key) {
        let itemName = `${this.domain()}_${name}`
        return this.getAll(itemName)[key]
    }
    set(name, key, value) {
        let data = this.getAll(name)
        data[key] = value;
        let itemName = `${this.domain()}_${name}`
        LOG.debug(`localStorage save item: ${itemName} -> ${key} (${JSON.stringify(data)})`)
        localStorage.setItem(itemName, JSON.stringify(data));
    }
    delete(name, key) {
        let itemName = `${this.domain()}_${name}`
        let data = this.getAll(name)
        LOG.debug(`localStorage delete Item: ${itemName} -> ${key}`)
        delete data[key];
        localStorage.setItem(itemName, JSON.stringify(data));
    }
}

export class ServerTasks extends ContextLocalStorage {

    getAll() {
        return super.getAll('tasks');
    }
    add(serverId, task) {
        LOG.debug(`save task ${serverId} ${task}`);
        super.set('tasks', serverId, 'building');
    }
    delete(serverId) {
        super.delete('tasks', serverId);
        LOG.debug(`delete task ${serverId}`);
        localStorage.removeItem(serverId);
    }
}

export var CONST = {
    // service name
    NOVA_COMPUTE: 'nova-compute',
    // unit
    UNIT_KB: 1024,
    UNIT_MB: 1024 * 1024,
    UNIT_GB: 1024 * 1024 * 1024,

    UNIT_1000: 1000,
    UNIT_1000_000: 1000000,
    // usage range of time
    USAGE_LAST_1_DAY: 'last1Day',
    USAGE_LAST_7_DAY: 'last7Days',
    USAGE_LAST_6_MONTHES: 'last6Monthes',
    USAGE_LAST_1_YEAR: 'last1Year',
}

export class UsageRange {
    constructor() {
        this.range = CONST.USAGE_LAST_1_DAY

        this.dataList = [];
    }
    getDataList() {
        let dateList = []
        switch (this.range) {
            case CONST.USAGE_LAST_1_DAY:
                dateList = Utils.lastDateList({ hour: 1 }, 25);
                break;
            case CONST.USAGE_LAST_7_DAY:
                dateList = Utils.lastDateList({ day: 1 }, 8);
                break;
            case CONST.USAGE_LAST_6_MONTHES:
                dateList = Utils.lastDateList({ month: 1 }, 7);
                break;
            case CONST.USAGE_LAST_1_YEAR:
                dateList = Utils.lastDateList({ month: 1 }, 13);
                break;
        }
        return dateList;
    }
}

export class Message {
    constructor(position) {
        let positionXY = position.split('-');
        this.y = positionXY[0];
        this.x = positionXY[1];
        this.notify = function (msg){
            console.log(msg)
        };
    }
    info(msg) {
        this.notify(msg, { x: this.x, y: this.y, color: 'info', timeout: 1000, icon: 'mdi-information' });
    }
    success(msg) {
        this.notify(msg, { x: this.x, y: this.y, color: 'success', timeout: 1000, icon: 'mdi-check-circle' });
    }
    warning(msg) {
        this.notify(msg, { x: this.x, y: this.y, color: 'warning', icon: 'mdi-alert-circle' });
    }
    error(msg) {
        this.notify(msg, { x: this.x, y: this.y, color: 'error', icon: 'mdi-close-circle' });
    }
}


export const MESSAGE = new Message(SETTINGS.ui.getItem('messagePosition').value);
export const LOG = new Logger({ level: Level.DEBUG });
