# vuetify-stack-board

Openstack Dashboard with Vuetify

## 1.环境要求

```
python >= 3.9
```

## 2.编译&安装 wheel包

1. 安装gettext：对于linux系统，先安装gettext工具，windowns无需操作安装。
   
   + Ubuntu：`apt get-install gettext`
   
   + Centos：`yum install gettext`

2. 编译：`python3 setup.py bdist_wheel`

3. 安装：`pip3 install dist/<THE_PATH_OF_WHEEL_FILE>`

安装成功后，可执行以下命令查看帮助信息

```shell
vastackboard --help
```

## 3.在docker容器中运行

1. 构建镜像

```shell
sh install/build.sh dist/<THE_PATH_OF_WHEEL_FILE>
```

2. 启动容器

```shell
VERSION=<VERSION>
mkdir -p /var/log/vstackboard
docker run -itd --network=host \
    -v /etc/vstackboard:/etc/vstackboard \
    -v /var/log/vstackboard:/var/log/vstackboard \
    --name vstackboard \
    vstackboard:${VERSION} \
    --log-file /var/log/vstackboard/vstackboard.log
```

## 4.直接运行（开发者模式）

1. 进入项目目录，设置环境变量
   
   + powershell: `$env:PYTHONPATH="./"`
   + cmd: `set PYTHONPATH=./`
   + shell: `export PYTHONPATH=./`

2. 执行文件 vsb.py： 
   
   ```python .\vstackboard\cmd\vsb.py```
   
   更多用法参考帮助信息。

## ChangeLog

### TODO

- [ ] 创建规格时可以从已有的复制
- [ ] inerface 卸载，自动检测后刷新表
- [ ] backup reset state 有时需执行多次才能成功, why?
- [ ] 修复删除agg后，AZ 列表残留的问题
- [ ] 禁止删除正在进行中的记录

### v0.0.6

- [x] 国际化
- [x] 上传镜像
- [x] UI调整
- [x] 支持删除镜像上传任务记录
- [x] 优化docker容器构建工具
- [x] 增加虚拟机操作：状态重置
- [x] 前端自定义配置
- [X] 前端国际化
- [x] Aggregate 管理
- [X] 新建虚拟机支持指定port

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