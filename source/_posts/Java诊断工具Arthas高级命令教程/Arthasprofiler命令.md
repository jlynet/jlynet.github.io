---
title: Arthas profiler命令
date: 2021-08-07 09:51:39
tags: ['Java 诊断工具 Arthas 高级命令教程']
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

本教程会以一个简单的应用为例，演示profiler命令。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## 启动arthas demo

下载`arthas-demo.jar`，再用`java -jar`命令启动：

```bash
wget https://arthas.aliyun.com/arthas-demo.jar;java -jar arthas-demo.jar
```

`arthas-demo`是一个很简单的程序，它随机生成整数，再执行因式分解，把结果打印出来。如果生成的随机数是负数，则会打印提示信息。

## 启动arthas-boot

在新的`Terminal 2`里，下载`arthas-boot.jar`，再用`java -jar`命令启动：

```bash
wget https://arthas.aliyun.com/arthas-boot.jar;java -jar arthas-boot.jar
```

`arthas-boot`是`Arthas`的启动程序，它启动后，会列出所有的Java进程，用户可以选择需要诊断的目标进程。

选择第一个进程，输入 `1` ，再`Enter/回车`：

```bash
1
```

Attach成功之后，会打印Arthas LOGO。输入 `help` 可以获取到更多的帮助信息。

```bash
help
```

![Arthas Boot](O1CN01HzatXZ1RgccrlT90M_!!6000000002141-2-tps-529-244.png)

## profiler命令

> 使用[async-profiler](https://github.com/jvm-profiling-tools/async-profiler)生成火焰图

`profiler` 命令支持生成应用热点的火焰图。本质上是通过不断的采样，然后把收集到的采样结果生成火焰图。

```
profiler` 命令基本运行结构是 `profiler action [actionArg]
```

#### 参数说明

| 参数名称    | 参数说明                                                     |
| ----------- | ------------------------------------------------------------ |
| *action*    | 要执行的操作                                                 |
| *actionArg* | 属性名模式                                                   |
| [i:]        | 采样间隔（单位：ns）（默认值：10'000'000，即10 ms）          |
| [f:]        | 将输出转储到指定路径                                         |
| [d:]        | 运行评测指定秒                                               |
| [e:]        | 要跟踪哪个事件（cpu, alloc, lock, cache-misses等），默认是cpu |

#### 查看所有支持的action

```bash
profiler actions
```

```console
$ profiler actions
Supported Actions: [resume, dumpCollapsed, getSamples, start, list, execute, version, stop, load, dumpFlat, actions, dumpTraces, status]
```

#### 查看版本

```bash
profiler version
```

```console
$ profiler version
Async-profiler 1.6 built on Sep  9 2019
Copyright 2019 Andrei Pangin
```

#### 启动profiler

```bash
profiler start -e itimer
```

```
$ profiler start -e itimer
Started [itimer] profiling
```

> 默认情况下，生成的是cpu的火焰图，即event为`cpu`。可以用`--event`参数来指定。 因为katacoda环境不支持perf_events，所以这里使用`-e itimer`参数指定event为itimer

#### 获取已采集的sample的数量

```bash
profiler getSamples
```

```
$ profiler getSamples
23
```

#### 查看profiler状态

```bash
profiler status
```

```console
$ profiler status
[itimer] profiling is running for 4 seconds
```

可以查看当前profiler在采样哪种`event`和采样时间。

#### 停止profiler

##### 生成svg格式结果

```bash
profiler stop
```

```
$ profiler stop
profiler output file: /tmp/demo/arthas-output/20191125-135546.svg
OK
```

默认情况下，生成的结果保存到应用的`工作目录`下的`arthas-output`目录。可以通过 `--file`参数来指定输出结果路径。比如：

```bash
profiler stop --file /tmp/output.svg
```

```console
$ profiler stop --file /tmp/output.svg
profiler output file: /tmp/output.svg
OK
```

##### 生成html格式结果

默认情况下，结果文件是`svg`格式，如果想生成`html`格式，可以用`--format`参数指定：

```bash
profiler stop --format html
```

```console
$ profiler stop --format html
profiler output file: /tmp/test/arthas-output/20191125-143329.html
OK
```

或者在`--file`参数里用文件名指名格式。比如`--file /tmp/result.html` 。

```bash
profiler stop --file /tmp/result.html
```

#### 通过浏览器查看arthas-output下面的profiler结果

默认情况下，arthas使用8563http端口，则可以打开： 目录下面的profiler结果：

![img](arthas-output.png)

点击可以查看具体的结果：

![img](arthas-output-svg.png)

> 如果是chrome浏览器，可能需要多次刷新。

#### profiler支持的events

```bash
profiler list
```

在不同的平台，不同的OS下面，支持的events各有不同。比如在macos下面：

```console
$ profiler list
Basic events:
  cpu
  alloc
  lock
  wall
  itimer
```

在linux下面

```console
$ profiler list
Basic events:
  cpu
  alloc
  lock
  wall
  itimer
Perf events:
  page-faults
  context-switches
  cycles
  instructions
  cache-references
  cache-misses
  branches
  branch-misses
  bus-cycles
  L1-dcache-load-misses
  LLC-load-misses
  dTLB-load-misses
  mem:breakpoint
  trace:tracepoint
```

如果遇到OS本身的权限/配置问题，然后缺少部分event，可以参考`async-profiler`本身文档：[async-profiler](https://github.com/jvm-profiling-tools/async-profiler)

可以用`--event`参数指定要采样的事件，比如对`alloc`事件进入采样：

```bash
profiler start --event alloc
```

```console
$ profiler start --event alloc
```

#### 恢复采样

```bash
profiler resume
```

```console
$ profiler resume
Started [cpu] profiling
```

`start`和`resume`的区别是：`start`是新开始采样，`resume`会保留上次`stop`时的数据。

通过执行`profiler getSamples`可以查看samples的数量来验证。

#### 使用`execute`来执行复杂的命令

比如开始采样：

```bash
profiler execute 'start,framebuf=5000000'
```

```console
profiler execute 'start,framebuf=5000000'
```

停止采样，并保存到指定文件里：

```bash
profiler execute 'stop,file=/tmp/result.svg'
```

```console
profiler execute 'stop,file=/tmp/result.svg'
```

具体的格式参考： [arguments.cpp](https://github.com/jvm-profiling-tools/async-profiler/blob/v1.8.1/src/arguments.cpp#L50)

## 更多信息

在“profiler”中，我们演示了了Arthas的profiler命令。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM