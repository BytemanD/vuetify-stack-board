# vuetify-stack-board
Openstack Dashboard with Vuetify

## ChangeLog

### TODO

- [ ] 查看console log
- [ ] 创建规格时可以从已有的复制
- [ ] volume支持状态重置
- [ ] inerface 卸载，自动检测后刷新表
- [ ] 上传镜像
- [ ] 修复 Volume 服务 expanded-item 显示问题
- [ ] backup reset state 有时需执行多次才能成功, why?

### v0.0.4

- [X] UI调整(添加app-bar、 ...)
- [X] 优化 upgrade 命令
- [X] 查看实例Actions
- [X] 查看操作events，以及错误堆栈
- [X] 创建虚拟机，允许指定keypair
- [X] 创建虚拟机，允许指定 volume type
- [X] volume-type 管理
- [X] 指定 Region
- [X] Aggregate 显示
- [X] 新建port，添加 vnic_type 等可选属性
- [X] QoS policy管理
- [ ] QoS policy rule 管理
- [X] Image 显示更多信息（id, block_device_mapping等）
- [X] backup支持状态重置
- [ ] Image 智能删除
- [ ] 安全组管理
- [ ] volume、、snapshot支持状态重置

### v0.0.3

- [X] 虚机操作添加：卷管理，网卡管理 Dailog, 可进行挂载/卸载操作
- [X] 加载dashboard前显示'骨架装饰器'
- [X] 路由/端口管理
- [X] 虚拟机 resize/migrate/pause/unpause
- [X] 增加keypair
- [X] 虚拟机rebuild
- [X] cinder backup 管理
- [X] cinder 服务管理
- [X] 虚拟化资源以进度条形式显示已用百分比
- [X] 简化代码(使用 async/await 语法代替原来的then，)
- [X] 路由端口管理
- [X] 卷快照管理
- [X] 卷备份管理
- [X] Flavor更新extra_specs
- [X] AZ管理(表格+树形结构图)
- [X] UI优化
- [X] 虚拟机网络拓扑图
- [X] 挂载网卡可指定net-id

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
