import VolumeDataTable from './tables/volume.js'
import FlavorDataTable from './tables/flavor.js'
import ServerDataTable from './tables/server.js'
import ServiceTable from './tables/service.js'
import UsageTable from './tables/usage.js'

export const volumeTable = new VolumeDataTable();
export const flavorTable = new FlavorDataTable();
export const serverTable = new ServerDataTable();
export const serviceTable = new ServiceTable();
export const usageTable = new UsageTable();
