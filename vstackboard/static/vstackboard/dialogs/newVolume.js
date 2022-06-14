import Dialog from './_base.js'

export class NewVolumeDialog extends Dialog {
    constructor() {
        super({
            name: '', size: 10, nums: 1, image: '', type: '', snapshot: '',
            snapshots: [], images: [], types: []
        })
    }

    commit() {
        for (var i = 1; i <= this.params.nums; i++) {
            let data = {
                name: this.params.nums > 1 ? `${this.params.name}-${i}` : this.params.name,
                size: parseInt(this.params.size)
            };
            if (this.params.image != '') { data.imageRef = this.params.image; }
            if (this.params.snapshot != '') { data.snapshot_id = this.params.snapshot; }
            if (this.params.type != '') { data.volume_type = this.params.type; }
            api.volume.create(data).then(resp => {
                volumeTable.refresh();
                Utils.checkVolumeStatus(resp.data.volume.id);
            }).catch(error => {
                MESSAGE.error(`${this.params.name} ${this.params.name} 创建失败, ${error.response.data.badRequest.message}`)
            })
        }
        MESSAGE.info(`卷 ${this.params.name} 创建中`);
        this.show = false;
    }
    open() {
        this.params.name = Utils.getRandomName('volume');
        api.snapshot.detail().then(resp => {
            this.params.snapshots = resp.data.snapshots;
            this.params.snapshots.splice(this.params.snapshots, 0, { name: '无', id: '' })
        })
        api.image.list().then(resp => {
            this.params.images = resp.data.images;
            this.params.images.splice(this.params.images, 0, { name: '无', id: '' })
        })
        api.volumeType.list().then(resp => {
            this.params.types.push()
            this.params.types = resp.data.volume_types;
            this.params.types.splice(this.params.types, 0, { name: '无', id: '' })
        })
        this.show = true;
    }
    cleanUpImageShapshot() {
        this.params.image = '';
        this.params.snapshot = '';

    }
}
