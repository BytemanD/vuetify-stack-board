import axios from 'axios';

import notify from './notify.js';
import { LOG, Utils, MESSAGE } from "./lib.js";

async function waitDeletedByList(api, bodyKey, item){
    let items = [];
    do {
        console.debug(new Date().toLocaleString(), `wait ${item.name || item.id} to be deleted`);
        items = (await api.list({ id: item.id }))[bodyKey];
        if (items.length != 0) {
            await Utils.sleep(5);
        }
    } while(items.length != 0);
}
async function waitDeletedByGet(api, bodyKey, item) {
    let itemBody = {};
    let deleted = false;
    do{
        try {
            console.debug(new Date().toLocaleString(), `wait ${item.name || item.id} to be deleted`);
            itemBody = (await api.get(item.id))[bodyKey];
            await Utils.sleep(3);
        } catch (error) {
            MESSAGE.success(`${item.id || item.name} 删除成功`);
            deleted = true;
        }
    }while(!deleted);
    return itemBody
}

class Restfulclient {
    constructor(baseUrl, async=false) {
        this.async = async;
        this.baseUrl = baseUrl;
    }
    getHeaders() {
        return null;
    }
    _parseToQueryString(filters) {
        if (!filters) { return '' }
        let queryParams = [];
        for (var key in filters) {
            if (Array.isArray(filters[key])) {
                LOG.debug(`filters: ${filters[key]}`)
                filters[key].forEach(value => {
                    queryParams.push(`${key}=${value}`)
                })
            } else {
                queryParams.push(`${key}=${filters[key]}`)
            }
        }
        return queryParams.join('&');
    }
    async waitDeleted() {

    }
    _getErrorMsg(response) {
        console.error(response)
        let errorData = response ? response.data : {};
        if (errorData.badRequest && errorData.badRequest.message) {
            return errorData.badRequest.message
        } else {
            return JSON.stringify(errorData)
        }
    }
    async get(url = null) {
        let reqUrl = this.baseUrl;
        if (url) {
            if (url.startsWith('/')) {
                reqUrl = url;
            } else {
                reqUrl = `${this.baseUrl}/${url}`;
            }
        }
        let resp = await axios.get(reqUrl, { headers: this.getHeaders() });
        return resp.data
    }
    async delete(id) {
        let resp = await axios.delete(
            `${this.baseUrl}/${id}`, { headers: this.getHeaders() });
        return resp.data
    }
    async doPost(body, url = null){
        try {
            let reqUrl = this.baseUrl;
            if (url) {
                if (url.startsWith('/')) {
                    reqUrl = url;
                } else {
                    reqUrl = `${this.baseUrl}/${url}`;
                }
            }
            let resp = await axios.post(
                reqUrl, body, { headers: this.getHeaders() });
            return resp
        } catch (e) {
            console.error(e);
            MESSAGE.error(this._getErrorMsg(e.response))
            throw e
        }
    }
    async post(body, url = null) {
        let resp = await this.doPost(body, url)
        return resp.data
    }
    async put(id, body) {
        let resp = await axios.put(`${this.baseUrl}/${id}`, body, { headers: this.getHeaders() });
        return resp.data
    }
    async show(id, filters = null) {
        let url = filters ? `${id}?${this._parseToQueryString(filters)}` : id;
        let data = await this.get(`${url}`, { headers: this.getHeaders() });
        return data
    }
    async list(filters = {}) {
        let queryString = this._parseToQueryString(filters);
        let url = this.baseUrl;
        if (queryString) { url += `?${queryString}` }
        let resp = await axios.get(`${url}`, { headers: this.getHeaders() });
        return resp.data;
    }
    async patch(id, body, headers = {}) {
        let config = { headers: this.getHeaders() };
        for (let key in headers) {
            config.headers[key] = headers[key];
        }
        let resp = await axios.patch(`${this.baseUrl}/${id}`, body, config);
        return resp.data
    }
    async postAction(id, action, data) {
        let body = {};
        body[action] = data;
        return (await axios.post(
            `${this.baseUrl}/${id}/action`, body, { headers: this.getHeaders() })).data;
    }

    async listActive() {
        return (await this.list({ status: 'active' }))
    }
}

class System extends Restfulclient {
    constructor() {
        super('');
    }
    async login(username, password){
        let auth = {
            username: username,
            password: password
        }
        return await this.doPost({auth: auth}, '/login')
    }
    async logout(){
        await this.delete('login')
        notify.success('成功退出')
    }
}

class OpenstackProxyAPI extends Restfulclient {
    constructor(baseUrl) {
        super(baseUrl);
    }
    async detail(filters = {}) {
        let queryString = this._parseToQueryString(filters);
        let url = 'detail';
        if (queryString) {
            url += `?${queryString}`
        }
        return await this.get(url);
    }
    async doAction(id, data) {
        return (await this.post(data, `${id}/action`));
    }
}

class Identity extends Restfulclient {
    constructor() {
        super('/identity');
    }
    getHeaders() {
        return {'X-Token': localStorage.getItem('X-Token')}
    }
    async index(clusterId){
        let headers = this.getHeaders()
        headers['X-Cluster-Id'] = clusterId
        await axios.get('/identity', { headers: headers })
    }
}

class Hypervisor extends OpenstackProxyAPI {
    constructor() { super('/computing/os-hypervisors') }
    async statistics() { return await this.get('statistics'); }
}

class Flavor extends OpenstackProxyAPI {
    constructor() { super('/computing/flavors') }
    async create(data) { return await this.post({ flavor: data }); }
    async getExtraSpecs(id) {
        return await this.get(`${id}/os-extra_specs`);
    }
    async updateExtras(id, extras) {
        return (await this.post({ 'extra_specs': extras }, `${id}/os-extra_specs`)).data;
    }
    async deleteExtra(id, key) {
        return (await this.delete(`${id}/os-extra_specs/${key}`)).data;
    }

    parseExtras(content) {
        let extras = {};
        let extraLines = content.split('\n');
        for (var i = 0; i < extraLines.length; i++) {
            let line = extraLines[i];
            if (line.trim() == '') { continue; }
            let kv = line.split('=');
            if (kv.length != 2) {
                MESSAGE.error(`输入内容有误: ${line}`)
                return;
            }
            let key = kv[0].trim();
            let value = kv[1].trim();
            if (key == '' || value == '') {
                MESSAGE.error(`输入内容有误: ${line}`)
                return;
            }
            extras[key] = value;
        }
        return extras;
    }
}

class AZ extends OpenstackProxyAPI {
    constructor() { super('/computing/os-availability-zone') }
}

class Aggregates extends Restfulclient {
    constructor() { super('/computing/os-aggregates') }
    async removeHost(aggId, host) {
        return await this.postAction(aggId, 'remove_host', { host: host });
    }
    async addHost(aggId, host) {
        return await this.postAction(aggId, 'add_host', { host: host });
    }
}

class Keypair extends Restfulclient {
    constructor() { super('/computing/os-keypairs') }
}
class ComputeService extends Restfulclient {
    constructor() { super('/computing/os-services') }

    async forceDown(id, down = true) {
        let resp = await this.put(`${id}`, { forced_down: down });
        return resp.data;
    }
    async disable(id) {
        let resp = await this.put(`${id}`, { status: 'disabled' });
        return resp.data;
    }
    async enable(id) {
        let resp = await this.put(`${id}`, { status: 'enabled' });
        return resp.data;
    }
    async getNovaComputeServices() {
        return (await this.list({ binary: 'nova-compute' })).services
    }
}

class Usage extends Restfulclient {
    constructor() { super('/computing/os-simple-tenant-usage') }
}
class Migrations extends Restfulclient {
    constructor() { super('/computing/os-migrations') }
}

class Server extends OpenstackProxyAPI {
    constructor() { super('/computing/servers') }
    async show(id) {
        return (await this.get(id)).server;
    }
    async detail(filters = {}) {
        filters.all_tenants = 1
        return await super.detail(filters)
    }
    async waitDeleted(item, serverTable) {
        let watcher = new ExpectServerDeleted(item, serverTable);
        await watcher.watch();
    }
    async list(filters = {}) {
        filters.all_tenants = 1
        return (await super.list(filters)).servers
    }
    _parseToQueryString(filters) {
        if (!filters) {
            return ''
        }
        let queryParams = [];
        for (var key in filters) {
            if (key == 'id') {
                queryParams.push(`uuid=${filters[key]}`)
            } else {
                queryParams.push(`${key}=${filters[key]}`)
            }
        }
        return queryParams.join('&');
    }
    async volumeBoot(data) {
        let respData = await this.post({ server: data }, '/computing/os-volumes_boot');
        return respData;
    }
    async imageBoot(data) {
        let respData = await this.post({ server: data });
        return respData;
    }
    async boot(name, flavorId, imageId, options = {}) {
        let data = {
            name: name, flavorRef: flavorId,
            min_count: options.minCount  || 1,
            max_count: options.maxCount|| 1,
        }
        if (options.description) {
            data.description = options.description
        }
        if (!options.networks || options.networks.length == 0) {
            data.networks = 'none';
        } else {
            data.networks = options.networks;
        }
        if (options.password && options.password != '') {
            let userData = [
                '#cloud-config',
                'chpasswd:',
                '  list: |',
                '    root:' + options.password.trim(),
                '  expire: False',
                '']
            data.user_data = window.btoa(userData.join('\n'));
        }
        if (options.az && options.az != '') {
            data.availability_zone = options.az;
            if (options.host && options.host != '') {
                data.availability_zone += `:${options.host}`;
            }
        }
        if (options.keyName) { data.key_name = options.keyName }
        if (options.useBdm) {
            data.block_device_mapping_v2 = [{
                boot_index: 0, source_type: 'image', destination_type: "volume",
                delete_on_termination: true,
                volume_size: options.volumeSize, uuid: imageId,
            }];
            if (options.volumeType) {
                data.block_device_mapping_v2[0].volume_type = options.volumeType;
            }
        } else {
            data.imageRef = imageId
        }
        if (options.securityGroup && options.securityGroup != '') {
            data.security_groups = options.securityGroup;
        }
        LOG.debug(`Boot server with data ${JSON.stringify(data)}`)
        if (options.useBdm) {
            return await this.volumeBoot(data);
        } else {
            return await this.imageBoot(data);
        }
    }
    async update(id, data) {
        let resp = await this.put(id, { server: data });
        return resp.data;
    }
    async getVncConsole(id, type = 'novnc') {
        return await this.post(
            { remote_console: { type: type, protocol: "vnc" } },
            `${id}/remote-consoles`);
    }
    async stop(id) {
        let resp = await this.doAction(id, { 'os-stop': null });
        return resp;
    }
    async start(id) {
        let resp = await this.doAction(id, { 'os-start': null })
        return resp;
    }
    async reboot(id, type = 'SOFT') {
        let resp = await this.doAction(id, { 'reboot': { type: type } })
        return resp;
    }
    async pause(id) {
        let resp = await this.doAction(id, { 'pause': null });
        return resp;
    }
    async unpause(id) {
        let resp = await this.doAction(id, { 'unpause': null });
        return resp.data;
    }

    async attachVolume(id, volumeId) {
        return await this.post(
            { volumeAttachment: { volumeId: volumeId } },
            `${id}/os-volume_attachments`);
    }
    async volumeAttachments(id) {
        return this.get(`${id}/os-volume_attachments`);
    }
    async volumeDetach(id, volumeId) {
        return await this.delete(`${id}/os-volume_attachments/${volumeId}`);
    }
    async interfaceList(id) {
        return await this.get(`${id}/os-interface`);
    }
    async interfaceAttach(id, vif) {
        // NOTE vif e.g. {net_id: <netId>} or {port_id: <portId>}
        await this.post({ 'interfaceAttachment': vif }, `${id}/os-interface`);
    }
    async interfaceDetach(id, portId) {
        let resp = await this.delete(`${id}/os-interface/${portId}`);
        return resp.data;
    }
    async changePassword(id, password, userName = null) {
        let data = { adminPass: password }
        if (userName) { data.userName = userName; }
        let resp = await this.doAction(id, { changePassword: data });
        return resp.data;
    }
    async resize(id, flavor_id) {
        return this.doAction(id, { resize: { flavorRef: flavor_id } })
    }
    async liveMigrate(id, host = null) {
        let data = { block_migration: "auto", host: host }
        return this.doAction(id, { 'os-migrateLive': data })
    }
    async migrate(id, host = null) {
        return this.doAction(id, { migrate: { host: host } })
    }
    async evacuate(id, params = {}) {
        let data = { force: params.force ? true : false }
        if (params.host) { data.host = params.host }
        return this.doAction(id, { evacuate: data })
    }
    async rebuild(id, options = {}) {
        let data = { description: null }
        for (let key in options) {
            if (options[key]) {
                data[key] = options[key]
            }
        }
        return this.doAction(id, { rebuild: data })
    }
    async actionList(id) {
        return (await this.get(`${id}/os-instance-actions`)).instanceActions
    }
    async actionShow(id, reqId) {
        return (await this.get(`${id}/os-instance-actions/${reqId}`)).instanceAction
    }
    async getConsoleLog(id, length = null) {
        return (await this.doAction(id, { 'os-getConsoleOutput': { length: length } })).output
    }
    async resetState(id, active = false) {
        return (await this.doAction(id, { 'os-resetState': { state: active ? 'active' : 'error' } }))
    }
    async getServerGroup(id){
        return (await this.get(`${id}/server-group`)).server.server_group;
    }
}
class ServerGroup extends Restfulclient {
    constructor() { super('/computing/os-server-groups') }
}
class Endpoint extends Restfulclient {
    constructor() { super('/identity/endpoints') }
    // interface=public
}
class Region extends Restfulclient {
    constructor() { super('/identity/regions') }
}

class Service extends Restfulclient {
    constructor() { super('/identity/services') }
    // interface=public
}

class User extends Restfulclient {
    constructor() { super('/identity/users') }
}
class Project extends Restfulclient {
    constructor() { super('/identity/projects') }
    async addUser(id, user, role) {
        return await this.put(`${id}/users/${user}/roles/${role}`, {})
    }
}
class Role extends Restfulclient {
    constructor() { super('/identity/roles') }
}
class Domain extends Restfulclient {
    constructor() { super('/identity/domains') }
    async enable(id) {
        await this.patch(id, { domain: { enabled: true } })
    }
    async disable(id) {
        await this.patch(id, { domain: { enabled: false } })
    }
}

class RoleAssignments extends Restfulclient {
    constructor() { super('/identity/role_assignments') }
    async listByProject(projectId) {
        return (await this.list({ 'scope.project.id': projectId })).role_assignments;
    }
}

class Image extends Restfulclient {
    constructor() {
        super('/image/v2/images');
    }
    async removeProperties(id, properties) {
        let data = [];
        for (let i in properties) {
            data.push({ path: `/${properties[i]}`, op: 'remove' });
        }
        return await this.patch(id, data, { 'Content-Type': 'application/openstack-images-v2.1-json-patch' })
    }
    async addProperties(id, properties) {
        let data = [];
        for (let key in properties) {
            data.push({ path: `/${key}`, value: properties[key], op: 'add' });
        }
        return await this.patch(id, data, { 'Content-Type': 'application/openstack-images-v2.1-json-patch' })
    }
    async uploadSlice(id, binary, size, blockSize, uploadCallback = null) {
        // TODO: What is the right maxSize
        let maxSize = 1024 * 1024 * parseInt(blockSize);
        let start = 0;
        let end = 0;
        while (end < size) {
            end = Math.min(start + maxSize, size);
            console.debug(`send ${size} data [${start}, ${end}]`)
            let startTime = new Date();
            await this.upload(id, binary.slice(start, end), size)
            let usedTime = (new Date() - startTime) / 1000;
            if (uploadCallback) {
                uploadCallback(end, size, (end - start) /usedTime)
            }
            start += maxSize;
        }
    }
    async upload(id, binary, size, uploadCallback = null){
        let self = this;
        let headers = this.getHeaders();
        headers['Content-Type'] = 'application/octet-stream';
        headers['x-image-meta-size'] = size;
        return axios({
            method: 'PUT',
            url: `${self.baseUrl}/${id}/file`,
            headers: headers,
            data: binary,
            onUploadProgress: function (progressEvent) {
                if (uploadCallback) {
                    uploadCallback(progressEvent.loaded, progressEvent.total)
                }
            },
        })
    }
    uploadSmall(id, file, uploadCallback = null) {
        let self = this
        let formData = new FormData();
        formData.append('file', file);
        return axios({
            url: `${self.baseUrl}/${id}/file`,
            method: 'PUT',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: function (progressEvent) {
                if (uploadCallback) {
                    uploadCallback(progressEvent.loaded, progressEvent.total)
                }
            },
        });
    }
}

class Network extends Restfulclient {
    constructor() { super('/networking/v2.0/networks') }
}
class Subnet extends Restfulclient {
    constructor() { super('/networking/v2.0/subnets') }
}
class Port extends Restfulclient {
    constructor() { super('/networking/v2.0/ports') }
}
class SecurityGroup extends Restfulclient {
    constructor() { super('/networking/v2.0/security_groups') }
}
class SecurityGroupRule extends Restfulclient {
    constructor() { super('/networking/v2.0/security_group_rules') }
    async create(data) {
        return (await this.post({ security_group_rule: data })).security_group_rule
    }
}
class QosPolicy extends Restfulclient {
    constructor() { super('/networking/v2.0/qos/policies') }
    async deleteBpsRule(id, ruleId) {
        return await this.delete(`${id}/bandwidth_limit_rules/${ruleId}`)
    }
    async addBpsRule(id, direction, params) {
        let data = { direction: direction }
        if (params.maxKbps != null) { data.max_kbps = parseInt(params.maxKbps) }
        if (params.maxBurstKbps != null) { data.max_burst_kbps = parseInt(params.maxBurstKbps) }
        let resp = await this.post({ bandwidth_limit_rule: data }, `${id}/bandwidth_limit_rules`);
        return resp;
    }
    async addPpsRule(id, direction, params) {
        let data = { direction: direction }
        if (params.maxKpps != null) { data.max_kpps = parseInt(params.maxKpps) }
        if (params.maxBurstKpps != null) { data.max_burst_kpps = parseInt(params.maxBurstKpps) }
        let resp = await this.post({ packet_rate_limit_rule: data }, `${id}/packet_rate_limit_rules`);
        return resp;
    }
    async deletePpsRule(id, ruleId) {
        return await this.delete(`${id}/packet_rate_limit_rules/${ruleId}`)
    }
}
class Router extends Restfulclient {
    constructor() { super('/networking/v2.0/routers'), this.portClient = new Port() }
    // interface=public
    async listInterface(id) {
        return (await this.portClient.list({ device_id: id })).ports
    }
    async addInterface(id, subnet_id) {
        return await this.put(`${id}/add_router_interface`, { subnet_id: subnet_id })
    }
    async removeSubnet(id, subnet_id) {
        return await this.put(`${id}/remove_router_interface`, { subnet_id: subnet_id })
    }
}
class Volume extends OpenstackProxyAPI {
    constructor() { super('/volume/volumes', true) }
    async create(data) { return this.post({ volume: data }) }
    async waitDeleted(item) {
        await waitDeletedByList(API.volume, 'volumes', item);
    }
    async waitVolumeStatus(volume_id, expectStatus = ['available', 'error']) {
        let body = {}
        let status = null;
        do {
            body = await API.volume.get(volume_id);
            status = body.volume.status;
            LOG.debug(`wait volume ${volume_id} status to be ${expectStatus}, now: ${status}`)
            if (expectStatus.indexOf(status) < 0) {
                await Utils.sleep(5);
            }
        } while (expectStatus.indexOf(status) < 0)
        return body.volume
    }
    async resetState(id, data) {
        return await this.doAction(id, { 'os-reset_status': data })
    }
    async actionList(resourceId) {
        return (await this.get(`/volume/os-resource-actions/${resourceId}`)).resourceActions
    }
    async actionShow(resourceId, requestId){
        return (await this.get(`/volume/os-resource-actions/${resourceId}/get_events?req_id=${requestId}`)).resourceAction;
    }
    async extend(id, newSize) {
        return await this.doAction(id, {'os-extend': {new_size: newSize}})
    }
}
class VolumePool extends OpenstackProxyAPI {
    constructor() { super('/volume/scheduler-stats/get_pools') }
    async detail(){
        return await this.list({detail: true})
    }
}
class Snapshot extends OpenstackProxyAPI {
    constructor() { super('/volume/snapshots') }
    async create(data) { return this.post({ snapshot: data }) }
    async waitDeleted(item) {
        await waitDeletedByList(API.snapshot, 'snpashots', item);
    }
    async waitSnapshotStatus(snapshot_id, expectStatus = ['available', 'error']) {
        let snapshot = {};
        while (expectStatus.indexOf(snapshot.status) < 0) {
            snapshot = (await API.snapshot.get(snapshot_id)).snapshot;
            LOG.debug(`wait snapshot ${snapshot_id} status to be ${expectStatus}, now: ${snapshot.status}`)
            if (expectStatus.indexOf(snapshot.status) < 0) {
                await Utils.sleep(3);
            }
        }
        return snapshot
    }
    async resetState(id, status) {
        return await this.doAction(id, { 'os-reset_status': { status: status } })
    }
}
class Backup extends OpenstackProxyAPI {
    constructor() { super('/volume/backups') }
    async waitDeleted(item) {
        await waitDeletedByGet(API.backup, 'backup', item);
    }
    async waitBackupDeleted(backup) {
        let backupBody = {};
        LOG.debug(`wait backup ${backup.id} to be deleted`)
        do{
            try {
                backupBody = (await API.backup.get(backup.id)).backup;
            } catch (error) {
                MESSAGE.success(`备份 ${backup.id} 删除成功`);
                break;
            }
            await Utils.sleep(3);
        }while(backupBody.status == 'error');

        if (backupBody.status == 'error') {
            MESSAGE.error(`备份 ${backup.id} 删除失败`);
        }
        return backupBody
    }
    async detail(filters = {}) {
        filters.all_tenants = 1
        return await super.detail(filters)
    }
    async list(filters = {}) {
        filters.all_tenants = 1
        return await super.list(filters)
    }
    async create(data) { return (await this.post({ backup: data })) }
    async resetState(id, status) {
        return await this.doAction(id, { 'os-reset_status': { status: status } })
    }
}
class VolumeService extends Restfulclient {
    constructor() { super('/volume/os-services') }
    async enable(binary, host) {
        return await this.put(`/enable`, { binary: binary, host: host })
    }
    async disable(binary, host) {
        return await this.put(`/disable`, { binary: binary, host: host })
    }
}
class VolumeType extends Restfulclient {
    constructor() { super('/volume/types') }
    async create(data) {
        return (await this.post({ volume_type: data })).volume_type;
    }
}

class Cluster extends Restfulclient {
    constructor() { super('/cluster') }

    async add(data) {
        return this.post({ cluster: data })
    }
}
class AuthInfo extends Restfulclient {
    constructor() { super('/auth_info') }
    async get() {
        return (await this.list()).auth_info
    }
}
class Task extends Restfulclient {
    constructor() { super('/tasks') }
}
class Actions extends Restfulclient {
    constructor() { super('/actions') }
    async checkLastVersion() {
        let body = await this.post({ 'checkLastVersion': {} });
        return body.checkLastVersion
    }
}
class Version extends Restfulclient {
    constructor() { super('/version') }
    async get() {
        return (await super.get()).version;
    }
}

export class SkylightAPI {
    constructor() {
        this.system = new System();
        // keystone
        this.idengity = new Identity()
        this.service = new Service();
        this.endpoint = new Endpoint();
        this.user = new User();
        this.project = new Project();
        this.role = new Role();
        this.domain = new Domain();
        this.roleAssignments = new RoleAssignments();

        this.region = new Region();
        // nova
        this.hypervisor = new Hypervisor();
        this.flavor = new Flavor();
        this.az = new AZ();
        this.agg = new Aggregates()
        this.computeService = new ComputeService();
        this.server = new Server();
        this.usage = new Usage();
        this.keypair = new Keypair();
        this.migration = new Migrations();
        this.serverGroup = new ServerGroup();
        // glance
        this.image = new Image();
        // neutron
        this.router = new Router();
        this.network = new Network();
        this.subnet = new Subnet();
        this.port = new Port();
        this.sg = new SecurityGroup();
        this.sgRule = new SecurityGroupRule();
        this.qosPolicy = new QosPolicy();
        // cinder
        this.volume = new Volume();
        this.volumeType = new VolumeType();
        this.snapshot = new Snapshot();
        this.backup = new Backup();
        this.volumeService = new VolumeService();
        this.volumePool = new VolumePool()

        this.cluster = new Cluster();
        this.authInfo = new AuthInfo();
        this.task = new Task();

        this.actions = new Actions();
        this.version = new Version();
    }
    getServerHosts(servers) {
        let serverHosts = []
        for (let i in servers) {
            if (!servers[i]['OS-EXT-SRV-ATTR:host']){
                continue;
            }
            serverHosts.push(servers[i]['OS-EXT-SRV-ATTR:host'])
        }
        return serverHosts;
    }
    async getMigratableHosts(servers) {
        let hosts = [];
        let services = await this.computeService.getNovaComputeServices();
        let serverHosts = this.getServerHosts(servers);
        for (let i in services){
            if (serverHosts.indexOf(services[i].host) >= 0 || services[i].state.toUpperCase() != 'UP'){
                continue
            }
            hosts.push(services[i].host);
        }
        return hosts
    }
}


class Expect {
    constructor(options={}){
        this.interval = options.interval || 5;
        this.intervalId = null;
    }
    async check(){
        return true;
    }
    async watch() {
        let finished = false;
        do {
            finished = await this.check();
            if (! finished){
                await Utils.sleep(this.interval);
            }
         } while (! finished)
    }
}

class ExpectServerStatus extends Expect {
    constructor(action, server, serverTable, expectStatus, options={}){
        super(options);
        this.action = action;
        this.server = server;
        this.expectStatus = expectStatus;
        this.serverTable = serverTable;
    }

    async check(){
        this.server = (await API.server.show(this.server.id)).server;
        let serverStatus = this.server.status.toUpperCase();
        LOG.debug(`等待实例 ${this.server.name || this.server.id} 状态变为(${this.expectStatus}, ERROR), 当前状态: ${serverStatus.toUpperCase()}`);

        if (this.serverTable){
            this.serverTable.updateItem(this.server);
        }
        return serverStatus == this.expectStatus.toUpperCase();
    }
}

export class ExpectServerCreated extends ExpectServerStatus {
    constructor(server, serverTable, options={}){
        super("创建", server, serverTable, 'ACTIVE', options);
    }
}
export class ExpectServerPaused extends ExpectServerStatus {
    constructor(server, serverTable, options={}){
        super("暂停", server, serverTable, 'PAUSED', options);
    }
}
export class ExpectServerUnpaused extends ExpectServerStatus {
    constructor(server, serverTable, options={}){
        super("取消暂停", server, serverTable, 'ACTIVE', options);
    }
}
export class ExpectServerShutoff extends ExpectServerStatus {
    constructor(server, serverTable, options={}){
        super("关机", server, serverTable, 'SHUTOFF', options);
    }
}
export class ExpectServerStarted extends ExpectServerStatus {
    constructor(server, serverTable, options={}){
        super("开机", server, serverTable, 'ACTIVE', options);
    }
}
export class ExpectServerRebooted extends ExpectServerStatus {
    constructor(server, serverTable, options={}){
        super("重启", server, serverTable, 'ACTIVE', options);
    }
}
export class ExpectServerRebuild extends ExpectServerStatus {
    constructor(server, serverTable, options={}){
        super("重建", server, serverTable, 'ACTIVE', options);
    }
}
export class ExpectServerResized extends ExpectServerStatus {
    constructor(server, serverTable, options={}){
        super("规格变更", server, serverTable, "ACTIVE", options);
        this.sourceFlavorName = this.server.flavor.original_name
    }
    async check(){
        let statusOk = await super.check();
        if (!statusOk) {
            return false
        }
        if (this.server.flavor.original_name != this.sourceFlavorName){
            MESSAGE.success(`虚拟机 ${this.action} 成功`)
        } else {
            MESSAGE.error(`虚拟机 ${this.action} 失败`)
        }
        return true;
    }
}
export class ExpectServerDeleted extends Expect {
    constructor(server, serverTable, options={}){
        super(options);
        this.server = server;
        this.serverTable = serverTable;
    }

    async check(){
        try {
            super.check()
        } catch (e) {
            console.error(e)
            MESSAGE.success(`实例 ${this.server.name || this.server.id} 删除成功`);
            return true
        }
        return false;
    }
}
Restfulclient.prototype.getHeaders = function () {
    let headers = {
        'X-Cluster-Id': localStorage.getItem('clusterId'),
        'X-Token': localStorage.getItem('X-Token'),
    };
    if (sessionStorage.getItem('region')){
        headers['X-Region'] = sessionStorage.getItem('region');
    }
    return headers;
}

const API = new SkylightAPI();

export default API;
