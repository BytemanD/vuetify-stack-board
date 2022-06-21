# vuetify-stack-board
Openstack Dashboard with Vuetify

## ChangeLog

### TODO

- [ ] 查看console log
- [ ] 挂载网卡可指定net-id
- [ ] 创建规格时可以从已有的复制
- [ ] volume-type 创建
- [ ] volume支持状态重置
- [ ] inerface 卸载，自动检测后刷新表
- [ ] 创建虚拟机，允许指定keypair
- [ ] 上传镜像

### v0.0.3

- [X] 虚机操作添加：卷管理，网卡管理 Dailog, 可进行挂载/卸载操作
- [X] 加载dashboard前显示'骨架装饰器'
- [X] 路由/端口管理
- [X] 虚拟机操作(resize, migrate liveMigrate)
- [ ] 增加keypair
- [ ] 虚拟机操作(pause, rebuild)

### v0.0.2

- [X] 同时管理多个Openstack 环境
- [X] 转为python3
- [X] 创建虚拟机，支持指定密码
- [X] 网络管理（更新属性、增删子网）

### v0.0.1

- [x] 常用资源显示
- [x] 虚拟机/卷/规格 创建
- [x] 虚拟机创建，支持选择节点,az 网络
- [x] volume创建，支持选择volume-type
- [x] hypervisor 显示 state， up状态 百分比
- [x] 资源批量删除
- [x] 增加虚拟机操作：开机，关机，重启，修改密码，卷挂载/卸载，网卡挂载、卸载
