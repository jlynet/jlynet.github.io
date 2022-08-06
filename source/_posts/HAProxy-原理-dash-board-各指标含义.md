---
title: HAProxy 原理 & dash board 各指标含义
date: 2022-08-04 11:05:01
categories: [默认分类,技术笔记]
tags: [技术笔记,linux,网络,随笔]
---



# 原理

1. HAProxy将客户端ip进行Hash计算并保存，由此确保相同IP访问时被转发到同一真实服务器上。
2. HAProxy依靠真实服务器发送给客户端的cookie信息进行回话保持。
3. HAProxy保存真实服务器的session及服务器标识，实现会话保持功能。

Frontend 负责client，Backend 负责server

# Dash board

![The HAProxy Stats Page](5838636e6baeef2e54c7ca7558d7ccab.png)

rate分了：

1. connection rate per second ：clients连接至HAProxy的频率（还没有创建完整的sessions）
2. session rate per second：session 作为一个持有端到端连接（client到HAProxy，HAProxy到后端服务器）状态的实体，被创建的速率
3. request rate per second：在建立的连接上，HTTP请求被接收的频率

# Session rate

![Frontend Session Rate](a3dffd6021911ebe8a2c1c09452180c9.png)

描述client连接到HAProxy的速率。

Cur： session 作为一个持有端到端连接（client到HAProxy，HAProxy到后端服务器）状态的实体，被创建的速率
Max： 同一时刻，使用中的最多session数
Limit： 前端每秒可接收的最大session数。设置在 rate-limit sessions. 如果这个限制被超过，多出来的连接将被pending在socket的backlog中（在系统buffer里）

# Sessions

![Frontend Sessions](d62d3b91aa1f5498149ee3537a423e73.png)

负载均衡器上，使用中的sessions或完整client-to-server连接的数量。

Cur： 当前建完sessions 数量
Max： 最多同时建过的sessions数
Limit：最大并发的sessions数，定义在 frontend中的maxconn。达到这个限制后，前端将停止接收新的连接。如果maxconn 没有设置，Limit将和您的配置中global那一节的maxconn 值相同。若这个也没设，那么Limit将基于您的系统（tnnd，在公司呆久了，都变您了）

# Denied

基于安全考虑，拒掉的request or response 数量

# Errors

![Frontend Errors](09a677f523174b9fb3a7bae5a61fb8b1.png)

- Req：遇到错误的request数量
- Conn：遇到错误的connection数量
- Resp：遇到错误的responds数量
  Server
  对frontend而言，只有Status有值

![Frontend Status](60fc37abd9894acad88cf3caea02d18e.png)

Status：当Status为OPEN时，frontend处于正常运行状态，并且可以接收traffic。当你执行Runtime API 命令 disable frontend ，你可以disable frontend，这时status将变为STOP。
对backend而言，Server 展示了关于 状态、健康程度、各server的权重。

![Backend Server Status](44def4c4f3298be4aa2c2cf313c64115.png)

Status：有如下的值

| Status   | What it means                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| UP       | The server is reporting as healthy.                                                                                  |
| DOWN     | The server is reporting as unhealthy and unable to receive requests.                                                 |
| NOLB     | You’ve added http-check disable-on-404 to the backend and the health checked URL has returned an HTTP 404 response. |
| MAINT    | The server has been disabled or put into maintenance mode.                                                           |
| DRAIN    | The server has been put into drain mode.                                                                             |
| no check | Health checks are not enabled for this server.                                                                       |

- LastChk :会有一个值 like L7OK/200 in 1ms。 表示已经执行了一个Layer 7的健康检查，并返回了一个HTTP 200 OK的response，且这一系列动作耗时<=1ms。      若您看到L4OK in 0ms，意味着Haproxy可以和server建立一个 Layer 4 connection
- Wght: traffic被接受的比例，as set by the weight parameter on the server line.
- Act：该server为active（标为Y）还是backup（标为 a -）
- Bck：该server为backup（标为Y） 还是 active（标为 a -）
- Chk： 失败的健康检查数
- Dwn：从UP到DOWN的transitions数量
- Dwntme：server 下线多久了

：session rate(每秒的连接会话信息)中的指标有cur,max,limit;其中cur表示每秒的当前会话数量；max表示每秒的最大会话数量；limit表示每秒新的会话限制量；sessions(会话信息)，cur:表示当前会话量；max:表示最大会话量；limit: 表示限制会话量；Total:表示总共会话量；

参考文献：

https://blog.51cto.com/superleedo/1895570

https://developer.aliyun.com/article/243184

https://www.haproxy.com/blog/exploring-the-haproxy-stats-page/


来源： https://blog.csdn.net/qq_22498427/article/details/108736804