---
title: Arthas arthas-boot支持的参数 案例
date: 2021-08-07 08:35:32
categories: [java技术栈]
tags: ['Java 诊断工具 Arthas 最佳实践']
---

<!-- toc -->

![Arthas](arthas.png)

`Arthas` 是Alibaba开源的Java诊断工具，深受开发者喜爱。在线排查问题，无需重启；动态跟踪Java代码；实时监控JVM状态。

`Arthas` 支持JDK 6+，支持Linux/Mac/Windows，采用命令行交互模式，同时提供丰富的 `Tab` 自动补全功能，进一步方便进行问题的定位和诊断。

当你遇到以下类似问题而束手无策时，Arthas可以帮助你解决：

- 这个类从哪个 jar 包加载的？为什么会报各种类相关的 Exception？
- 我改的代码为什么没有执行到？难道是我没 commit？分支搞错了？
- 遇到问题无法在线上 debug，难道只能通过加日志再重新发布吗？
- 线上遇到某个用户的数据处理有问题，但线上同样无法 debug，线下无法重现！
- 是否有一个全局视角来查看系统的运行状况？
- 有什么办法可以监控到JVM的实时运行状态？
- 怎么快速定位应用的热点，生成火焰图？

本教程会以一个简单的应用为例，演示arthas-boot支持的参数。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## Arthas demo

下载`arthas-demo.jar`，再用`java -jar`命令启动：

```bash
wget https://arthas.aliyun.com/arthas-demo.jar;java -jar arthas-demo.jar
```



`arthas-demo`是一个很简单的程序，它随机生成整数，再执行因式分解，把结果打印出来。如果生成的随机数是负数，则会打印提示信息。

## arthas-boot支持的参数

在新的`Terminal 2`里，下载`arthas-boot.jar`：

```bash
wget https://arthas.aliyun.com/arthas-boot.jar
```

`arthas-boot.jar` 支持很多参数，可以执行 `java -jar arthas-boot.jar -h` 来查看。

```bash
java -jar arthas-boot.jar -h
```

```console
$ java -jar arthas-boot.jar -h
[INFO] arthas-boot version: 3.3.6
Usage: arthas-boot [-h] [--target-ip <value>] [--telnet-port <value>]
       [--http-port <value>] [--session-timeout <value>] [--arthas-home <value>]
       [--use-version <value>] [--repo-mirror <value>] [--versions] [--use-http]
       [--attach-only] [-c <value>] [-f <value>] [--height <value>] [--width
       <value>] [-v] [--tunnel-server <value>] [--agent-id <value>] [--stat-url
       <value>] [--select <value>] [pid]

Bootstrap Arthas

EXAMPLES:
  java -jar arthas-boot.jar <pid>
  java -jar arthas-boot.jar --target-ip 0.0.0.0
  java -jar arthas-boot.jar --telnet-port 9999 --http-port -1
  java -jar arthas-boot.jar --tunnel-server 'ws://192.168.10.11:7777/ws'
  java -jar arthas-boot.jar --tunnel-server 'ws://192.168.10.11:7777/ws'
--agent-id bvDOe8XbTM2pQWjF4cfw
  java -jar arthas-boot.jar --stat-url 'http://192.168.10.11:8080/api/stat'
  java -jar arthas-boot.jar -c 'sysprop; thread' <pid>
  java -jar arthas-boot.jar -f batch.as <pid>
  java -jar arthas-boot.jar --use-version 3.3.6
  java -jar arthas-boot.jar --versions
  java -jar arthas-boot.jar --select arthas-demo
  java -jar arthas-boot.jar --session-timeout 3600
  java -jar arthas-boot.jar --attach-only
  java -jar arthas-boot.jar --repo-mirror aliyun --use-http
WIKI:
  https://arthas.aliyun.com/doc

Options and Arguments:
 -h,--help                      Print usage
    --target-ip <value>         The target jvm listen ip, default 127.0.0.1
    --telnet-port <value>       The target jvm listen telnet port, default 3658
    --http-port <value>         The target jvm listen http port, default 8563
    --session-timeout <value>   The session timeout seconds, default 1800
                                (30min)
    --arthas-home <value>       The arthas home
    --use-version <value>       Use special version arthas
    --repo-mirror <value>       Use special maven repository mirror, value is
                                center/aliyun or http repo url.
    --versions                  List local and remote arthas versions
    --use-http                  Enforce use http to download, default use https
    --attach-only               Attach target process only, do not connect
 -c,--command <value>           Command to execute, multiple commands separated
                                by ;
 -f,--batch-file <value>        The batch file to execute
    --height <value>            arthas-client terminal height
    --width <value>             arthas-client terminal width
 -v,--verbose                   Verbose, print debug info.
    --tunnel-server <value>     The tunnel server url
    --agent-id <value>          The agent id register to tunnel server
    --stat-url <value>          The report stat url
    --select <value>            select target process by classname or
                                JARfilename
 <pid>                          Target pid
```

## 参数详解

### 指定目标pid

可以使用`jps`命令查看pid。

```bash
jps
```

直接在参数中添加pid，可指定目标pid。

```bash
java -jar arthas-boot.jar 1
```

### 允许外部访问

默认情况下， arthas server侦听的是 `127.0.0.1` 这个IP，如果希望远程可以访问，可以使用`--target-ip`的参数。

```bash
java -jar arthas-boot.jar --target-ip 0.0.0.0
```

### 列出所有的版本

```bash
java -jar arthas-boot.jar --versions
```

使用指定版本：

```bash
java -jar arthas-boot.jar --use-version 3.1.0
```

### 打印运行的详情

使用`-v`或者`-verbose`。

```bash
java -jar arthas-boot.jar -v
```

### 指定需要执行的命令目标pid

可以使用`--command`或者`-c`参数指定，并同时指定pid，多个命令之间用`;`分隔。

```bash
java -jar arthas-boot.jar -c 'sysprop; thread' 1
```

### 指定需要执行的批处理文件目标pid

可以使用`--command`或者`-c`参数指定，并同时指定pid。

```bash
java -jar arthas-boot.jar -f batch.as 1
```

### 通过类名或者jar文件名指定目标进程

通过`--select`参数类名或者jar文件名指定目标进程

```bash
java -jar arthas-boot.jar --select arthas-demo
```

### 指定会话超时秒数

使用`--session-timeout`参数指定，默认为1800(30分钟)

```bash
java -jar arthas-boot.jar --session-timeout 3600
```

### 仅附加目标进程，不连接

```bash
java -jar arthas-boot.jar --attach-only
```

### 指定镜像仓库，强制使用http

`--repo-mirror`使用特定maven仓库镜像，参数可以为`center/aliyun`或http仓库地址。

`--use-http`强制使用http下载，默认使用https。

```bash
java -jar arthas-boot.jar --repo-mirror aliyun --use-http
```

### 指定arthas客户端命令行宽高

```bash
java -jar arthas-boot.jar --height 25 --width 80
```

### 指定arthas主目录

```bash
java -jar arthas-boot.jar --arthas-home .
```

### 以Java Agent的方式启动

通常Arthas是以动态attach的方式来诊断应用，但从3.2.0版本起，Arthas支持直接以 java agent的方式启动。

比如下载全量的arthas zip包，解压之后以 -javaagent 的参数指定arthas-agent.jar来启动：

```
java -javaagent:/tmp/test/arthas-agent.jar -jar arthas-demo.jar
```

默认的配置项在解压目录里的arthas.properties文件里。

参考： https://docs.oracle.com/javase/8/docs/api/java/lang/instrument/package-summary.html

## 使用as.sh

Arthas 支持在 Linux/Unix/Mac 等平台上一键安装：

```bash
curl -L https://arthas.aliyun.com/install.sh | sh
```

上述命令会下载启动脚本文件 `as.sh` 到当前目录，你可以放在任何地方或将其加入到 `$PATH` 中。

直接在shell下面执行`./as.sh`，就会进入交互界面。

也可以执行`./as.sh -h`来获取更多参数信息, 具体用法与`java -jar arthas-boot.jar`类似。

## 更多信息

通过本教程基本掌握了Arthas boot支持的参数。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM