
class Restfulclient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    _parseToQueryString(filters) {
        if (!filters) {
            return ''
        }
        let queryParams = [];
        for (var key in filters) { queryParams.push(`${key}=${filters[key]}`) }
        return queryParams.join('&');
    }
    list(filters = {}) {
        let queryString = this._parseToQueryString(filters);
        let url = this.baseUrl;
        if (queryString) {
            url += `?${queryString}`
        }
        return axios.get(`${url}`);
    };
    show(id) { return axios.get(`${this.baseUrl}/${id}`) };
    delete(id) { return axios.delete(`${this.baseUrl}/${id}`) };
    post(body) { return axios.post(`${this.baseUrl}`, body) };
    put(id, body) { return axios.put(`${this.baseUrl}/${id}`, body) };


}
class ClientExt extends Restfulclient {
    constructor(baseUrl) { super(baseUrl); }
    detail(filters = {}) {
        let queryString = this._parseToQueryString(filters);
        let url = `${this.baseUrl}/detail`;
        if (queryString) {
            url += `?${queryString}`
        }
        return axios.get(url);
    };
}

class Hypervisor extends ClientExt {
    constructor() { super('/computing/os-hypervisors') }
    statistics() { return axios.get(`${this.baseUrl}/statistics`) };
}

class Flavor extends ClientExt {
    constructor() { super('/computing/flavors') }
    create(data) { return this.post({ flavor: data }) }
    getExtraSpecs(id) {
        return axios.get(`${this.baseUrl}/${id}/os-extra_specs`)
    }
    updateExtras(id, extras) {
        return axios.post(`${this.baseUrl}/${id}/os-extra_specs`, { 'extra_specs': extras })
    }
}

class AZ extends ClientExt {
    constructor() { super('/computing/os-availability-zone') }
}

class ComputeService extends Restfulclient {
    constructor() { super('/computing/os-services') }

    forceDown(id, down = true) {
        return axios.put(`${this.baseUrl}/${id}`, { forced_down: down })
    }
    disable(id) {
        return axios.put(`${this.baseUrl}/${id}`, { status: 'disabled' })
    }
    enable(id) {
        return axios.put(`${this.baseUrl}/${id}`, { status: 'enabled' })
    }
}

class Usage extends Restfulclient {
    constructor() { super('/computing/os-simple-tenant-usage') }
}

class Server extends ClientExt {
    constructor() { super('/computing/servers') };
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
    volumeBoot(data) {
        return axios.post('/computing/os-volumes_boot',
            { server: data })
    };
    imageBoot(data) { return axios.post('/computing/servers', { server: data }) };
    boot(name, flavorId, imageId, options = {}) {
        let data = {
            name: name, flavorRef: flavorId,
            max_count: options.minCount || 1,
            min_count: options.maxCount || 1
        };
        if (!options.networks) {
            data.networks = 'none';
        } else {
            data.networks = options.networks;
        }
        if (options.az && options.az != '') {
            data.availability_zone = options.az;
            if (options.host && options.host != '') {
                data.availability_zone += `:${options.host}`;
            }
        }
        if (options.useBdm) {
            data.block_device_mapping_v2 = [{
                boot_index: 0, source_type: 'image', destination_type: "volume",
                delete_on_termination: true,
                volume_size: options.volumeSize, uuid: imageId,
            }];
        } else {
            data.imageRef = imageId
        }
        if (options.useBdm) {
            return this.volumeBoot(data);
        } else {
            return this.imageBoot(data);
        }
    }
    getVncConsole(id) {
        return axios.post(`${this.baseUrl}/${id}/remote-consoles`,
            { "remote_console": { "type": "novnc", "protocol": "vnc" } }
        )
    }
    stop(id) {
        return axios.post(`${this.baseUrl}/${id}/action`, { 'os-stop': null })
    }
    start(id) {
        return axios.post(`${this.baseUrl}/${id}/action`, { 'os-start': null })
    }
    reboot(id, type = 'SOFT') {
        return axios.post(`${this.baseUrl}/${id}/action`, { 'reboot': { type: type } })
    }
    changePassword(id, password, userName = null) {
        let data = { adminPass: password }
        if (userName) { data.userName = userName; }
        return axios.post(`${this.baseUrl}/${id}/action`, { 'changePassword': data });
    }
    attachVolume(id, volumeId) {
        return axios.post(`${this.baseUrl}/${id}/os-volume_attachments`,
            { volumeAttachment: { volumeId: volumeId } });
    }
    volumeAttachments(id) {
        return axios.get(`${this.baseUrl}/${id}/os-volume_attachments`);
    }
    volumeDetach(id, volumeId) {
        return axios.delete(`${this.baseUrl}/${id}/os-volume_attachments/${volumeId}`);
    }
    interfaceList(id) {
        return axios.get(`${this.baseUrl}/${id}/os-interface`);
    }
    interfaceAttach(id, vif) {
        // NOTE vif e.g. {net_id: <netId>} or {port_id: <portId>}
        return axios.post(`${this.baseUrl}/${id}/os-interface`, { 'interfaceAttachment': vif });
    }
    interfaceDetach(id, portId) {
        return axios.delete(`${this.baseUrl}/${id}/os-interface/${portId}`);
    }
}

class Endpoint extends Restfulclient {
    constructor() { super('/identity/endpoints') };
    // interface=public
}

class Service extends Restfulclient {
    constructor() { super('/identity/services') };
    // interface=public
}

class User extends Restfulclient {
    constructor() { super('/identity/users') };
}

class Image extends Restfulclient {
    constructor() { super('/image/v2/images') };
}

class Router extends Restfulclient {
    constructor() { super('/networking/v2.0/routers') };
    // interface=public
}
class Network extends Restfulclient {
    constructor() { super('/networking/v2.0/networks') };
}
class Subnet extends Restfulclient {
    constructor() { super('/networking/v2.0/subnets') };
}
class Port extends Restfulclient {
    constructor() { super('/networking/v2.0/ports') };
}
class Volume extends ClientExt {
    constructor() { super('/volume/volumes') };
    create(data) { return this.post({ volume: data }) }
}
class Snapshot extends ClientExt {
    constructor() { super('/volume/snapshots') };
    create(data) { return this.post({ snapshot: data }) }
}
class VolumeType extends Restfulclient {
    constructor() { super('/volume/types') };
}

export class OpenstackProxyApi {
    constructor() {
        // keystone
        this.service = new Service();
        this.endpoint = new Endpoint()
        this.user = new User();
        // nova
        this.hypervisor = new Hypervisor();
        this.flavor = new Flavor()
        this.az = new AZ();
        this.computeService = new ComputeService()
        this.server = new Server()
        this.usage = new Usage()
        // glance
        this.image = new Image()
        // neutron
        this.router = new Router();
        this.network = new Network();
        this.subnet = new Subnet();
        this.port = new Port();
        // cinder
        this.volume = new Volume();
        this.volumeType = new VolumeType();
        this.snapshot = new Snapshot();
    }
}

const API = new OpenstackProxyApi();

export default API;
