---
title: Arthas dashboard命令
date: 2021-08-07 09:51:34
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

本教程会以一个简单的应用为例，演示dashboard命令。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## 启动arthas-demo

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

## dashboard 命令

`dashboard` 命令可以查看当前系统的实时数据面板。

```bash
dashboard
```

当运行在Ali-tomcat时，会显示当前tomcat的实时信息，如HTTP请求的qps, rt, 错误数, 线程池信息等等。

```
$ dashboard
ID   NAME                           GROUP           PRIORITY   STATE     %CPU      DELTA_TIME TIME      INTERRUPTE DAEMON
-1   C2 CompilerThread0             -               -1         -         1.55      0.077      0:8.684   false      true
53   Timer-for-arthas-dashboard-07b system          5          RUNNABLE  0.08      0.004      0:0.004   false      true
22   scheduling-1                   main            5          TIMED_WAI 0.06      0.003      0:0.287   false      false
-1   C1 CompilerThread0             -               -1         -         0.06      0.003      0:2.171   false      true
-1   VM Periodic Task Thread        -               -1         -         0.03      0.001      0:0.092   false      true
49   arthas-NettyHttpTelnetBootstra system          5          RUNNABLE  0.02      0.001      0:0.156   false      true
16   Catalina-utility-1             main            1          TIMED_WAI 0.0       0.000      0:0.029   false      false
-1   G1 Young RemSet Sampling       -               -1         -         0.0       0.000      0:0.019   false      true
17   Catalina-utility-2             main            1          WAITING   0.0       0.000      0:0.025   false      false
34   http-nio-8080-ClientPoller     main            5          RUNNABLE  0.0       0.000      0:0.016   false      true
23   http-nio-8080-BlockPoller      main            5          RUNNABLE  0.0       0.000      0:0.011   false      true
-1   VM Thread                      -               -1         -         0.0       0.000      0:0.032   false      true
-1   Service Thread                 -               -1         -         0.0       0.000      0:0.006   false      true
-1   GC Thread#5                    -               -1         -         0.0       0.000      0:0.043   false      true
Memory                     used     total    max      usage    GC
heap                       36M      70M      4096M    0.90%    gc.g1_young_generation.count   12
g1_eden_space              6M       18M      -1       33.33%                                  86
g1_old_gen                 30M      50M      4096M    0.74%    gc.g1_old_generation.count     0
g1_survivor_space          491K     2048K    -1       24.01%   gc.g1_old_generation.time(ms)  0
nonheap                    66M      69M      -1       96.56%
codeheap_'non-nmethods'    1M       2M       5M       22.39%
metaspace                  46M      47M      -1       98.01%
Runtime
os.name                                                        Mac OS X
os.version                                                     10.15.4
java.version                                                   15
java.home                                                      /Library/Java/JavaVirtualMachines/jdk-15.jdk/Contents/Home
systemload.average                                             10.68
processors                                                     8
uptime                                                         272s
```

输入 `q` 或者 `Ctrl+C` 可以退出dashboard命令。

```bash
q
```

#### 数据说明

- ID: Java级别的线程ID，注意这个ID不能跟jstack中的nativeID一一对应。
- NAME: 线程名
- GROUP: 线程组名
- PRIORITY: 线程优先级, 1~10之间的数字，越大表示优先级越高
- STATE: 线程的状态
- CPU%: 线程的cpu使用率。比如采样间隔1000ms，某个线程的增量cpu时间为100ms，则cpu使用率=100/1000=10%
- DELTA_TIME: 上次采样之后线程运行增量CPU时间，数据格式为`秒`
- TIME: 线程运行总CPU时间，数据格式为`分:秒`
- INTERRUPTED: 线程当前的中断位状态
- DAEMON: 是否是daemon线程

##### JVM内部线程

Java 8之后支持获取JVM内部线程CPU时间，这些线程只有名称和CPU时间，没有ID及状态等信息（显示ID为-1）。 通过内部线程可以观测到JVM活动，如GC、JIT编译等占用CPU情况，方便了解JVM整体运行状况。

- 当JVM 堆(heap)/元数据(metaspace)空间不足或OOM时，可以看到GC线程的CPU占用率明显高于其他的线程。
- 当执行`trace/watch/tt/redefine`等命令后，可以看到JIT线程活动变得更频繁。因为JVM热更新class字节码时清除了此class相关的JIT编译结果，需要重新编译。

JVM内部线程包括下面几种：

- JIT编译线程: 如 `C1 CompilerThread0`, `C2 CompilerThread0`
- GC线程: 如`GC Thread0`, `G1 Young RemSet Sampling`
- 其它内部线程: 如`VM Periodic Task Thread`, `VM Thread`, `Service Thread`

## dashboard 数据说明

- *ID*: Java级别的线程ID，注意这个ID不能跟jstack中的nativeID一一对应
- *NAME*: 线程名
- *GROUP*: 线程组名
- *PRIORITY*: 线程优先级, 1~10之间的数字，越大表示优先级越高
- *STATE*: 线程的状态
- *CPU%*: 线程消耗的cpu占比，采样100ms，将所有线程在这100ms内的cpu使用量求和，再算出每个线程的cpu使用占比。
- *TIME*: 线程运行总时间，数据格式为`分：秒`
- *INTERRUPTED*: 线程当前的中断位状态
- *DAEMON*: 是否是daemon线程

### 截图展示

![img](dashboard.png)

## 更多信息

通过本教程基本掌握了Arthas dashboard的用法。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM