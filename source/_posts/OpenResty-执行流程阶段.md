---
title: OpenResty 执行流程阶段
date: 2021-10-17 20:01:02
categories: [默认分类,技术笔记]
tags: [技术笔记,shell,linux,nginx,随笔]
---

nginx有11个处理阶段，如下图所示：

![img](292052-20190628170848889-787127502.png)

|                      指令                      |     所处处理阶段     |               使用范围                | 解释                                                         |
| :--------------------------------------------: | :------------------: | :-----------------------------------: | :----------------------------------------------------------- |
|          init_by_lua init_by_lua_file          |    loading-config    |                 http                  | nginx Master进程加载配置时执行；通常用于初始化全局配置/预加载Lua模块 |
|   init_worker_by_lua init_worker_by_lua_file   |   starting-worker    |                 http                  | 每个Nginx Worker进程启动时调用的计时器，如果Master进程不允许则只会在init_by_lua之后调用；通常用于定时拉取配置/数据，或者后端服务的健康检查 |
|           set_by_lua set_by_lua_file           |       rewrite        | server,server if,location,location if | 设置nginx变量，可以实现复杂的赋值逻辑；此处是阻塞的，Lua代码要做到非常快； |
|       rewrite_by_lua rewrite_by_lua_file       |     rewrite tail     |   http,server,location,location if    | rrewrite阶段处理，可以实现复杂的转发/重定向逻辑；            |
|        access_by_lua access_by_lua_file        |     access tail      |   http,server,location,location if    | 请求访问阶段处理，用于访问控制                               |
|       content_by_lua content_by_lua_file       |       content        |         location，location if         | 内容处理器，接收请求处理并输出响应                           |
| header_filter_by_lua header_filter_by_lua_file | output-header-filter |  http，server，location，location if  | 设置header和cookie                                           |
|   body_filter_by_lua body_filter_by_lua_file   |  output-body-filter  |  http，server，location，location if  | 对响应数据进行过滤，比如截断、替换。                         |
|           log_by_lua log_by_lua_file           |         log          |  http，server，location，location if  | log阶段处理，比如记录访问量/统计平均响应时间                 |

## 指令解释

**init_by_lua\***：初始化 nginx 和预加载 lua(nginx 启动和 reload 时执行)；
**init_worker_by_lua\***：每个工作进程(worker_processes)被创建时执行，用于启动一些定时任务，
比如心跳检查，后端服务的健康检查，定时拉取服务器配置等；
**ssl_certificate_by_lua\***：对 https 请求的处理，即将启动下游 SSL（https）连接的 SSL 握手时执行，用例：按照每个请求设置 SSL 证书链和相应的私钥，按照 SSL 协议有选择的拒绝请求等；
**set_by_lua\***：设置 nginx 变量；
**rewrite_by_lua\***：重写请求（从原生 nginx 的 rewrite 阶段进入），执行内部 URL 重写或者外部重定向，典型的如伪静态化的 URL 重写；
**access_by_lua\***：处理请求（和 rewrite_by_lua 可以实现相同的功能，从原生 nginx 的 access阶段进入）；
**content_by_lua\***：执行业务逻辑并产生响应，类似于 jsp 中的 servlet；
**balancer_by_lua\***：负载均衡；
**header_filter_by_lua\***：处理响应头；
**body_filter_by_lua\***：处理响应体；
**log_by_lua\***：记录访问日志；

一般我们在开发过程中常用到的阶段如下：

```
set_by_lua、rewrite_by_lua、access_by_lua、content_by_lua、header_filter_by_lua、body_filter_by_lua、log_by_lua、
```

1.set_by_lua

  做流程分支判断，判断变量初始化

2.rewrite_by_lua

  转发重定向，缓存功能

3.access_by_lua

  ip准入，接口合法权限判断，根据iptable做防火墙的功能

4.content_by_lua

  内容生产

5.header_filter_by_lua

  增加头部信息

6.body_filter_by_lua

  内容过滤

7.log_by_lua

  记录日志

 文章转载：https://www.cnblogs.com/fly-kaka/p/11102849.html