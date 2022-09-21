# vuetify-stack-board

Openstack Dashboard with Vuetify

## 环境要求

```
python >= 3.9
```

## 在docker容器中运行

1. 构建镜像

```
python3 setup.py bdist_wheel
sh install/build.sh /the/path/of/wheel/file
```

2. 启动容器

```
VERSION=<VERSION>
mkdir -p /var/log/vstackboard
docker run -itd --network=host \
    -v /etc/vstackboard:/etc/vstackboard \
    --name vstackboard \
    vstackboard:${VERSION} \
    --log-file /var/log/vstackboard/vstackboard.log
```

## 直接运行

1. 进入项目目录，设置环境变量
   
   + powershell: `$env:PYTHONPATH="./"`
   + bat: `set PYTHONPATH=./`
   + shell: `export PYTHONPATH=./`

2. 执行文件vsb.py
   
    ```python .\vstackboard\cmd\vsb.py <command>```

## ChangeLog

### TODO

- [ ] 创建规格时可以从已有的复制
- [ ] inerface 卸载，自动检测后刷新表
- [ ] 修复 Volume 服务 expanded-item 显示问题
- [ ] backup reset state 有时需执行多次才能成功, why?
- [ ] 修复删除agg后，AZ 列表残留的问题

### v0.0.6

- [x] 国际化
- [X] 上传镜像

### v0.0.5

- [x] 虚拟机安全组更新操作
- [x] 查看console log
- [x] 用户管理
- [x] 角色管理
- [x] 端口安全组更新操作
- [x] domain 管理
- [x] project 管理

### v0.0.4

- [x] UI调整(添加app-bar、 ...)
- [x] 优化 upgrade 命令
- [x] 查看实例Actions
- [x] 查看操作events，以及错误堆栈
- [x] 创建虚拟机，允许指定keypair
- [x] 创建虚拟机，允许指定 volume type
- [x] volume-type 管理
- [x] 指定 Region
- [x] Aggregate 显示
- [x] 新建port，添加 vnic_type 等可选属性
- [x] QoS policy管理
- [x] QoS policy rule 管理
- [x] Image 显示更多信息（id, block_device_mapping等）
- [x] backup、volume、snapshot支持状态重置
- [x] Image 智能删除
- [x] 安全组基本管理
- [x] 创建虚拟机指定安全组
- [x] image大小显示人性化
- [x] image属性管理

### v0.0.3

- [x] 虚机操作添加：卷管理，网卡管理 Dailog, 可进行挂载/卸载操作
- [x] 加载dashboard前显示'骨架装饰器'
- [x] 路由/端口管理
- [x] 虚拟机 resize/migrate/pause/unpause
- [x] 增加keypair
- [x] 虚拟机rebuild
- [x] cinder backup 管理
- [x] cinder 服务管理
- [x] 虚拟化资源以进度条形式显示已用百分比
- [x] 简化代码(使用 async/await 语法代替原来的then，)
- [x] 路由端口管理
- [x] 卷快照管理
- [x] 卷备份管理
- [x] Flavor更新extra_specs
- [x] AZ管理(表格+树形结构图)
- [x] UI优化
- [x] 虚拟机网络拓扑图
- [x] 挂载网卡可指定net-id

### v0.0.2

- [x] 同时管理多个Openstack 环境
- [x] 转为python3
- [x] 创建虚拟机，支持指定密码
- [x] 网络管理（更新属性、增删子网）

### v0.0.1

- [x] 常用资源显示
- [x] 虚拟机/卷/规格 创建
- [x] 虚拟机创建，支持选择节点,az 网络
- [x] volume创建，支持选择volume-type
- [x] hypervisor 显示 state， up状态 百分比
- [x] 资源批量删除
- [x] 增加虚拟机操作：开机，关机，重启，修改密码，卷挂载/卸载，网卡挂载、卸载