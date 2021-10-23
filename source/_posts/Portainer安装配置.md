---
title: Portainer安装配置
date: 2021-10-09 12:09:14
categories: [默认分类,技术笔记]
tags: [技术笔记,shell,linux,docker,随笔]
---

<!-- toc -->

## 什么是portainer

官网：https://www.portainer.io/

Portainer（基于 Go） 是一个轻量级的Web管理界面，可让您轻松管理 Docker 主机 或 Swarm 集群。
Portainer 的使用意图是简单部署。 它包含可以在任何 Docker 引擎上运行的单个容器（Docker for Linux 和 Docker for Windows）。
Portainer 允许您管理 Docker 容器、image、volume、network 等。 它与独立的 Docker 引擎和 Docker Swarm 兼容。

Portainer简化了Swarm和Kubernetes环境中的容器管理。它被软件工程师和DevOps团队用来简化和加速软件部署。

## 安装过程

**服务器A**上安装docker 和 portainer，服务器A的IP是192.168.31.88

1、安装docker
https://www.cnblogs.com/wudequn/p/11515610.html
2、容器安装portainer
```
docker pull portainer/portainer
docker run -d -p 9000:9000 -v /root/portainer:/data -v /var/run/docker.sock:/var/run/docker.sock --name portainer portainer/portainer

-d #容器在后台运行
-p 9000:9000 # 宿主机9000端口映射容器中的9000端口
-v /var/run/docker.sock:/var/run/docker.sock # 把宿主机的Docker守护进程(docker daemon)默认监听的Unix域套接字挂载到容器中
-v /root/portainer:/data # 把宿主机目录 /root/portainer 挂载到容器 /data 目录；
–name portainer # 指定运行容器的名称
```
注意： 在启动容器时必须挂载本地 /var/run/docker.socker与容器内的/var/run/docker.socker连接。

3、访问 192.168.31.88:9000

第一次需要初始化密码，账号是admin

![img](1122716-20200802184652699-1641613819.png)

 单机版这里选择local即可，选择完毕，点击Connect即可连接到本地docker：

![img](1122716-20200802191619195-1073028043.png)

 注意：该页面上有提示需要挂载本地 /var/run/docker.socker与容器内的/var/run/docker.socker连接。因此，在启动时必须指定该挂载文件。

![img](1122716-20200802193100848-231293653.png)

## 添加Endpoints

上面安装后只是添加了本地的docker对应的Endpoints，现在添加一个其他**服务器B**的docker。

服务器B的ip 192.168.31.101

docker配置文件为/etc/docker/daemon.json

```
insecure-registries：私有镜像仓库
"insecure-registries":["ip:端口","ip:端口",]

registry-mirrors：镜像加速地址，一般改为国内的
"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"] 
Docker 官方中国区: https://registry.docker-cn.com
网易: http://hub-mirror.c.163.com
中科大: https://docker.mirrors.ustc.edu.cn
  "registry-mirrors" : [
    "http://ovfftd6p.mirror.aliyuncs.com",
    "http://registry.docker-cn.com",
    "http://docker.mirrors.ustc.edu.cn",
    "http://hub-mirror.c.163.com"
  ]

"hosts": ["tcp://0.0.0.0:2375", "unix:///var/run/docker.sock"]
```

1、配置Docker主机，允许远程连接
```
{"hosts": ["tcp://0.0.0.0:2375", "unix:///var/run/docker.sock"]}
```
或者
1. 编辑docker.service
```
vim /usr/lib/systemd/system/docker.service
找到 ExecStart字段修改如下
ExecStart=/usr/bin/dockerd-current -H tcp://0.0.0.0:2375 -H unix://var/run/docker.sock 
```
2. 重启docker重新读取配置文件，重新启动docker服务
```
systemctl daemon-reload
systemctl restart docker
```

2、重启docker引擎，使配置生效
```
systemctl daemon-reload 
systemctl restart docker
```
3、Portainer添加endpoints

![img](1122716-20200802205854088-1876842657.png)

![img](1122716-20200802210111306-984201563.png)

 添加完后。

![img](1122716-20200802210209846-1481039968.png)

文章转载： https://www.cnblogs.com/wudequn/p/13419922.html