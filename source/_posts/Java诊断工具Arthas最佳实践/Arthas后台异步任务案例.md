---
title: Arthas 后台异步任务 案例
date: 2021-08-07 08:35:31
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

本教程会以一个简单的应用为例，演示后台异步任务。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## Arthas demo

下载`arthas-demo.jar`，再用`java -jar`命令启动：

```bash
wget https://arthas.aliyun.com/arthas-demo.jar;java -jar arthas-demo.jar
```

`arthas-demo`是一个很简单的程序，它随机生成整数，再执行因式分解，把结果打印出来。如果生成的随机数是负数，则会打印提示信息。

## Start arthas-boot

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

## 后台异步任务

arthas中的后台异步任务，使用了仿linux系统任务相关的命令。[linux任务相关介绍](https://ehlxr.me/2017/01/18/Linux-中-fg、bg、jobs、-指令/)。

## 使用&在后台执行任务

比如希望执行后台执行trace命令，那么调用下面命令

```bash
trace demo.MathGame primeFactors &
```

这时命令在后台执行，可以在console中继续执行其他命令。

## 通过jobs查看任务

如果希望查看当前有哪些arthas任务在执行，可以执行jobs命令，执行结果如下

```bash
jobs
```

```console
$ jobs
[1]*
       Running           trace demo.MathGame primeFactors &
       execution count : 49
       start time      : Wed Jul 22 05:47:52 GMT 2020
       timeout date    : Thu Jul 23 05:47:52 GMT 2020
       session         : aa75753d-74f1-4929-a829-7ff965345183 (current)
```

可以看到目前有一个后台任务在执行。

job id是10, `*` 表示此job是当前session创建

状态是Stopped

execution count是执行次数，从启动开始已经执行了19次

timeout date是超时的时间，到这个时间，任务将会自动超时退出

## 任务暂停和取消

当任务正在前台执行，比如直接调用命令`trace Test t`或者调用后台执行命令`trace Test t &`后又通过fg命令将任务转到前台。这时console中无法继续执行命令，但是可以接收并处理以下事件：

`ctrl + z`：将任务暂停。通过jbos查看任务状态将会变为Stopped，通过`bg <job-id>`或者`fg <job-id>`可让任务重新开始执行

`ctrl + c`：停止任务

`ctrl + d`：按照linux语义应当是退出终端，目前arthas中是空实现，不处理

## fg、bg命令，将命令转到前台、后台继续执行

- 任务在后台执行或者暂停状态（`ctrl + z`暂停任务）时，执行`fg <job-id>`将可以把对应的任务转到前台继续执行。在前台执行时，无法在console中执行其他命令
- 当任务处于暂停状态时（`ctrl + z`暂停任务），执行`bg <job-id>`将可以把对应的任务在后台继续执行
- 非当前session创建的job，只能由当前session `fg`到前台执行

## 任务输出重定向

可通过>或者>>将任务输出结果输出到指定的文件中，可以和&一起使用，实现arthas命令的后台异步任务。比如：

```bash
trace demo.MathGame primeFactors >> test.out &
```

这时trace命令会在后台执行，并且把结果输出到`~/logs/arthas-cache/test.out`。可继续执行其他命令。并可查看文件中的命令执行结果。

```bash
cat test.out
```

当连接到远程的arthas server时，可能无法查看远程机器的文件，arthas同时支持了自动重定向到本地缓存路径。使用方法如下：

```bash
trace demo.MathGame primeFactors >> &
```

```console
$ trace Test t >>  &
job id  : 2
cache location  : /Users/gehui/logs/arthas-cache/28198/2
```

可以看到并没有指定重定向文件位置，arthas自动重定向到缓存中了，执行命令后会输出`job id`和`cache location`。`cache location`就是重定向文件的路径，在系统logs目录下，路径包括`pid`和`job id`，避免和其他任务冲突。命令输出结果到`/Users/gehui/logs/arthas-cache/28198/2`中，`job id`为2。

## 停止命令

异步执行的命令，如果希望停止，可执行`kill`

## 其他

- 最多同时支持8个命令使用重定向将结果写日志
- 请勿同时开启过多的后台异步命令，以免对目标JVM性能造成影响
- 如果不想停止arthas，继续执行后台任务，可以执行 `quit` 退出arthas控制台（`stop` 会停止arthas 服务）

## 更多信息

通过本教程基本掌握了Arthas后台异步任务。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM