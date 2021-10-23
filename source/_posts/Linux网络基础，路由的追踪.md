---
title: Linux网络基础，路由的追踪
date: 2021-10-18 15:25:16
categories: [默认分类,技术笔记]
tags: [技术笔记,shell,linux,网络,随笔]
---


# 一、 traceroute
> Linux traceroute命令用于显示数据包到主机间的路径。
> traceroute指令让你追踪网络数据包的路由途径，预设数据包大小是40Bytes，用户可另行设置。
## 语法
```bash
traceroute [-46ndFT] [-f<存活数值>] [-g<网关>] [-i(--interface)<device>] [-I(--icmp)] [-m<存活数值>] [-N<数据包数量>] [-p<通信端口>] [-s<来源地址>] [-t<服务类型>] [-w<超时秒数>]
```
## 参数说明
```
-4 ===> IPV4
-6 ===> IPV6
-d ===> 使用Socket层级的排错功能
-f ===> 设置第一个检测数据包的存活数值TTL的大小
-g ===> 设置来源路由网关，最多可设置8个
-i ===> 指定traceroute应该通过哪个接口发送数据包；默认情况下，根据路由表选择接口
-I ===> 使用ICMP回应取代UDP资料信息
-m ===> 设置检测数据包的最大存活数值TTL的大小
-p ===> 设置UDP传输协议的通信端口
-s ===> 设置本地主机送出数据包的IP地址
-t ===> 对于IPV4来说是设置服务类型(TOS)和优先值；对于IPV6来说是设置流量控制值
-T ===> 使用TCP进行探测
-w ===> 设置等待远端主机回报的时间
-F ===> 不要分段探测数据包
-n ===> 在显示IP地址时，不要将它们映射到主机名
-N ===> 指定同时发送的探测包的数量;默认值是16
```

# 二、 tracepath
>tracepath命令用来追踪并显示报文到达目的主机所经过的路由信息，能够发现路由中的MTU值。tracepath使用套接字API来实现其所有功能，不需要root权限。
## 语法
```bash
tracepath [-n] [-b] [-l pktlen] [-m max_hops] [-p port] [目的地址]
```
## 参数说明
```
-n ===> 输出主要的IP地址
-b ===> 同时输出主机名和IP地址
-l ===> 设置数据包大小；默认65535
-m ===> 设置最大跳数；默认30
-p ===> 设置要使用的初始目标端口
```

# 三、 mtr
> MTR是一种简单的跨平台命令行网络诊断工具，它将常用的traceroute和ping程序的功能组合到一个工具中。 与traceroute类似， mtr输出关于数据包从运行mtr的主机到用户指定的目标主机的路由信息​​。
## 语法
```bash
mtr [-lxu(--udp)T(--tcp)46] [-r (--report)] [-w (--report-wide)] [-c (--report-cycles)] [-l (--raw)] [-x (--xml)] [-a (--addres]  [-i (--interval)] [-m (--max-ttl)] [-f (--first-ttl)] [-B (--bitpattern)] [-Q (--tos)] [-s (--psize)] [-P (--port)] [--timeout] [目的地] [数据包大小]
```
## 参数说明
```
-4 ===> IPV4
-6 ===> IPV6
-c ===> 设置发送的ping的数量
-r ===> 进入report模式.此模式下，mtr将运行-c选项指定的周期数，然后输出统计信息并退出
-w ===> 进入wide report模式。在此模式下，mtr将不会删除报告中的主机名
-s ===> 设置探测包大小，字节数包括IP和ICMP头部信息
-l ===> 使用原始输出格式
-x ===> 使用xml输出格式
-a ===> 将发送数据包的插座绑定到特定的接口,这样任何数据包都可以通过这个接口发送
-i ===> 指定ICMP之间的请求间隔
-m ===> 指定最大跳数(最大生存时间值)默认30
-f ===> 指定开始跳数，默认为1
-B ===> 指定在有效负载中使用的位模式(0-255)
-Q ===> 指定IP报头中的服务字段（0-255）
-P ===> 指定TCP跟踪的目标端口号
--timeout ===> 在放弃连接之前，保持TCP套接字打开的秒数连接。这只会影响最后一跳
```
## 应用举例1 基本展示
```bash
zt-web6:/app/sinova$ mtr -4 -6 -x -c 1 -n --report miniapp.yun.139.com -P 443
Start: Mon Oct 18 15:50:53 2021
HOST: zt-web6                     Loss%   Snt   Last   Avg  Best  Wrst StDev
  1.|-- 2409:805c:5c00::102        0.0%     1    1.6   1.6   1.6   1.6   0.0
  2.|-- 2409:805c:5cff:ffff:ffff:  0.0%     1    0.1   0.1   0.1   0.1   0.0
  3.|-- 2409:805c:0:614c::2        0.0%     1    3.3   3.3   3.3   3.3   0.0
  4.|-- 2409:805c:0:6108::         0.0%     1    4.0   4.0   4.0   4.0   0.0
  5.|-- 2409:805c:0:1003::         0.0%     1    0.6   0.6   0.6   0.6   0.0
  6.|-- 2409:8080:0:2:1903:1971::  0.0%     1    0.9   0.9   0.9   0.9   0.0
  7.|-- 2409:8080:0:1:305:1903::   0.0%     1   12.0  12.0  12.0  12.0   0.0
  8.|-- 2409:8080:0:2:305:362:1f0  0.0%     1   17.0  17.0  17.0  17.0   0.0
  9.|-- 2409:8055:3008:1116::a0    0.0%     1   14.3  14.3  14.3  14.3   0.0
 10.|-- 2409:8c54:813:5::1:0       0.0%     1   16.1  16.1  16.1  16.1   0.0
 11.|-- ???                       100.0     1    0.0   0.0   0.0   0.0   0.0
 12.|-- 2409:8c54:813:3::11        0.0%     1   19.2  19.2  19.2  19.2   0.0
 13.|-- ???                       100.0     1    0.0   0.0   0.0   0.0   0.0
```
第一列：显示的是IP地址和本机域名；
第二列 Loss%：是显示的每个对应IP的丢包率；
第三列 snt：snt等于1，设置每秒发送数据包的数量，默认值是10 可以通过参数 -c来指定。
第四列 Last：显示的最近一次的返回时延。
第五列Avg：平均值，这个应该是发送ping包的平均时延。
第六列Best：最好或者说时延最短的时间。
第七列Wrst：最坏或者说时延最长的时间。
第八列StDev：标准偏差。

## 应用举例二：设置每秒发送数据包的数量30
```bash
mtr -r -c 30 www.xqblog.com
```

## 应用举例3：设置ping包大小为1024个字节
```bash
mtr -r -c 30 -s 1024 www.xqblog.com
```

# 四、 netstat
> Netstat 命令用于显示各种网络相关信息，如网络连接，路由表，接口状态 (Interface Statistics)，masquerade 连接，多播成员 (Multicast Memberships) 等等。
显示网络连接，路由表，接口状态，伪装连接，网络链路信息和组播成员组。
## 语法
```bash
netstat [地址] [-t (--tcp)] [-u (--udp)] [-l (--listening)] [-a (--all)] [-n (--numeric)] [--numeric-hosts] [--numeric-ports] [-p (--program)] [-v (--verbose)] [-c (--continuous)] [delay]

netstat {-r (--route)} [地址] [-e (--extend)] [-v (--verbose)] [-n (--numeric)]  [--numeric-hosts] [--numeric-ports] [--numeric-ports] [-c (--continuous)] [delay]

netstat {-i (--interfaces)} [iface] [-a (--all)] [-e (--extend)] [-v (--verbose)] [-p (--program)] [-n (--numeric)] [--numeric-hosts] [--numeric-ports] [--numeric-ports] [-c (--continuous)] [delay]
```
## 参数说明
```
注意：[地址]无选项时,netstat显示打开的套接字.如果不指定任何地址族，那么打印出所有已配置地址族的有效套接字。
-t ===> 仅显示tcp连接
-u ===> 仅显示udp连接
-l ===> 只显示正在侦听的套接字(这是默认的选项)
-a ===> 显示所有正在或不在侦听的套接字。加上 --interfaces 选项将显示没有标记的接口
-n ===> 显示数字形式地址而不是去解析主机、端口或用户名
--numeric-hosts ===> 显示数字形式的主机但是不影响端口或用户名的解析
--numeric-ports ===> 显示数字端口号，但是不影响主机或用户名的解析
-N ===> 
delay === > 每隔 delay 秒,循环输出统计信息
-p ===> 显示套接字所属进程的PID和名称
-v ===> 显示详细信息
-c ===> 将使 netstat 不断地每秒输出所选的信息
```

# 五、 route
## 语法
```bash
route [-CFvne]

route [-v] [-A] add [-net|-host] target [netmask] [gw Gw] [metric] [mss] [window] [irtt ] [reject] [mod] [dyn] [reinstate] [[dev] If]

route [-v] [-A] del [-net|-host] target [gw] [netmask] [metric] [[dev] If]
```
## 参数说明
```
-C ===> 显示内核的路由缓存
-F ===> 显示内核的FIB选路表
-n ===> 以数字形式代替解释主机名形式来显示地址
-e ===> 用net‐stat(8)的格式来显示选路表

-A ===> 用指定的地址族(如`inet'，`inet6')
-v ===> 选用细节操作模式
-net ===> 路由目标为网络
-host ===> 路由目标为主机
add ===> 添加一条路由
del ===> 删除一条路由
target ===> 指定目标网络或主机
netmask ===>为添加的路由指定网络掩码
gw ===> 为发往目标网络/主机的任何分组指定网关
metric ===> 设置路由值字段
mss ===> 设置基于此路由之上的连接的TCP最大报文段长度
window ===> 设置基于此路由之上的连接的TCP窗口长度
irtt ===> 设置基于此路由之上的TCP连接的初始往返时间
reject ===> 设置一条阻塞路由以使一条路由查找失败
mod,dyn,reinstate ===> 设置一条动态的或更改过的路由
dev If ===> 强制使路由与指定的设备关联
```