import {
    DomainTable, ProjectTable, RoleTable, UserTable, HypervisortTable,
    VolumeDataTable, VolumeTypeTable, SnapshotTable, BackupTable,
    FlavorDataTable,VolumeServiceTable ,KeypairDataTable, ServerDataTable, UsageTable, ComputeServiceTable,
    RegionTable, AZDataTable,
    RouterDataTable, NetDataTable, PortDataTable, SecurityGroupDataTable, QosPolicyDataTable, 
    ImageDataTable,
    ClusterTable,
    AggDataTable, MigrationDataTable, EndpointTable,
} from './tables.jsx';
// import { 
//     NewClusterDialog, ProjectUserDialog, NewUserDialog, RolesDialog, NewRoleDialog,
    
//     NewServerDialog, ServerVolumeDialog, ServerInterfaceDialog, NewFlavorDialog,
//     FlavorExtraDialog, ChangePasswordDialog, ChangeServerNameDialog,
//     ResizeDialog, MigrateDialog, NewKeypairDialog, RebuildDialog,
//     EvacuateDialog, UpdateServerSG,
//     ServerTopology, ServerActionsDialog,
//     ServerActionEventsDialog,
//     ServerConsoleLogDialog,

//     NewVolumeDialog, NewVolumeTypeDialog, NewSnapshotDialog, NewBackupDialog,
//     VolumeResetStateDialog, BackupResetStateDialog, SnapshotResetStateDialog,
//     ImageDeleteSmartDialog, ImagePropertiesDialog,

//     NewRouterkDialog, NewNetworkDialog, NewSubnetDialog, RouterInterfacesDialog,
//     NewPortDialog, UpdatePort, NewQosPolicyDialog, QosPolicyRules,
//     NewQosPolicyRule, NewSGDialog, NewSGRuleDialog, SGRulesDialog,
// } from './dialogs.js';


export const userTable = new UserTable();
export const projectTable = new ProjectTable();
export const roleTable = new RoleTable();
export const domainTable = new DomainTable();
export const endpointTable = new EndpointTable();

export const hypervisorTable = new HypervisortTable();
export const volumeTable = new VolumeDataTable();
export const volumeTypeTable = new VolumeTypeTable();
export const snapshotTable = new SnapshotTable();
export const flavorTable = new FlavorDataTable();
export const backupTable = new BackupTable();
export const volumeComputeServiceTable = new VolumeServiceTable();

export const keypairTable = new KeypairDataTable();
export const serverTable = new ServerDataTable();
export const usageTable = new UsageTable();
export const aggTable = new AggDataTable();
export const migrationTable = new MigrationDataTable();

export const serviceTable = new ComputeServiceTable();
export const routerTable = new RouterDataTable();
export const netTable = new NetDataTable();
export const portTable = new PortDataTable();
export const sgTable = new SecurityGroupDataTable();

export const qosPolicyTable = new QosPolicyDataTable();
export const clusterTable = new ClusterTable();
export const regionTable = new RegionTable();
export const azTable = new AZDataTable();

export const imageTable = new ImageDataTable();

// export const newCluster = new NewClusterDialog()

// export const projectUserDialog = new ProjectUserDialog();
// export const newUserDialog = new NewUserDialog();
// export const rolesDialog = new RolesDialog();
// export const newRoleDialog = new NewRoleDialog();

// export const newServer = new NewServerDialog()
// export const serverVolumeDialog = new ServerVolumeDialog();
// export const serverInterfaceDialog = new ServerInterfaceDialog();
// export const newFlavor = new NewFlavorDialog()
// export const flavorExtraDialog = new FlavorExtraDialog();
// export const changePassword = new ChangePasswordDialog()
// export const changeServerName = new ChangeServerNameDialog()
// export const resizeDialog = new ResizeDialog();
// export const migrateDialog = new MigrateDialog();
// export const evacuateDialog = new EvacuateDialog();
// export const newKeypairDialog = new NewKeypairDialog();
// export const rebuildDialog = new RebuildDialog();
// export const updateServerSG = new UpdateServerSG();

// export const newVolume = new NewVolumeDialog()
// export const newVolumeTypeDialog = new NewVolumeTypeDialog();
// export const newSnapshotDialog = new NewSnapshotDialog();
// export const newBackupDialog = new NewBackupDialog();
// export const volumeResetStateDialog = new VolumeResetStateDialog();
// export const backupResetStateDialog = new BackupResetStateDialog();
// export const snapshotResetStateDialog = new SnapshotResetStateDialog();
// export const imageDeleteSmartDialog = new ImageDeleteSmartDialog();
// export const imagePropertiesDialog = new ImagePropertiesDialog();

// export const newRouterDialog = new NewRouterkDialog();
// export const newNetDialog = new NewNetworkDialog();
// export const newSubnetDialog = new NewSubnetDialog();
// export const routerInterfacesDialog = new RouterInterfacesDialog();
// export const newPortDialog = new NewPortDialog();
// export const updatePortDialog = new UpdatePort();

// export const newQosPolicyDialog = new NewQosPolicyDialog();
// export const qosPolicyRulesDialog = new QosPolicyRules();
// export const newQosPolicyRule = new NewQosPolicyRule();
// export const newSGDialog = new NewSGDialog();
// export const newSGRuleDialog = new NewSGRuleDialog();
// export const sgRulesDialog = new SGRulesDialog();

// export const serverTopology = new ServerTopology();
// export const serverActions = new ServerActionsDialog();
// export const serverActionEvents = new ServerActionEventsDialog();
// export const serverConsoleLog = new ServerConsoleLogDialog();

export default null;
