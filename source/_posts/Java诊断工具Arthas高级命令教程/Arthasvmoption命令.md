---
title: Arthas vmoption命令
date: 2021-08-07 09:51:26
categories: [java技术栈]
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

本教程会以一个简单的应用为例，演示vmoption命令。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## 启动arthas demo

下载`arthas-demo.jar`，再用`java -jar`命令启动：

```bash
wget https://arthas.aliyun.com/arthas-demo.jar;java -jar arthas-demo.jar
```

`arthas-demo`是一个很简单的程序，它随机生成整数，再执行因式分解，把结果打印出来。如果生成的随机数是负数，则会打印提示信息。

为了和使用vmoption后的效果作对比，此时使用`Ctrl+c`，程序很自然地退出。 Ctrl+C

再次启动`arthas-demo`：

```bash
java -jar arthas-demo.jar
```

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

## vmoption命令

查看，更新VM诊断相关的参数

```bash
vmoption -h
```

```console
[arthas@48]$ vmoption -h
 USAGE:
   vmoption [-h] [name] [value]

 SUMMARY:
   Display, and update the vm diagnostic options.

 Examples:
   vmoption
   vmoption PrintGCDetails
   vmoption PrintGCDetails true

 WIKI:
   https://arthas.aliyun.com/doc/vmoption

 OPTIONS:
 -h, --help                           this help
 <name>                               VMOption name
 <value>                              VMOption value
```

### 使用参考

#### 查看所有的option：

```bash
vmoption
```

```console
[arthas@56963]$ vmoption
 KEY                    VALUE                   ORIGIN                 WRITEABLE
---------------------------------------------------------------------------------------------
 HeapDumpBeforeFullGC   false                   DEFAULT                true
 HeapDumpAfterFullGC    false                   DEFAULT                true
 HeapDumpOnOutOfMemory  false                   DEFAULT                true
 Error
 HeapDumpPath                                   DEFAULT                true
 CMSAbortablePrecleanW  100                     DEFAULT                true
 aitMillis
 CMSWaitDuration        2000                    DEFAULT                true
 CMSTriggerInterval     -1                      DEFAULT                true
 PrintGC                false                   DEFAULT                true
 PrintGCDetails         true                    MANAGEMENT             true
 PrintGCDateStamps      false                   DEFAULT                true
 PrintGCTimeStamps      false                   DEFAULT                true
 PrintGCID              false                   DEFAULT                true
 PrintClassHistogramBe  false                   DEFAULT                true
 foreFullGC
 PrintClassHistogramAf  false                   DEFAULT                true
 terFullGC
 PrintClassHistogram    false                   DEFAULT                true
 MinHeapFreeRatio       0                       DEFAULT                true
 MaxHeapFreeRatio       100                     DEFAULT                true
 PrintConcurrentLocks   false                   DEFAULT                true
```

#### 查看指定的option

```bash
vmoption PrintGCDetails
```

```console
[arthas@56963]$ vmoption PrintGCDetails
 KEY                    VALUE                   ORIGIN                 WRITEABLE
---------------------------------------------------------------------------------------------
 PrintGCDetails         false                   MANAGEMENT             true
```

#### 更新指定的option

```bash
vmoption PrintGCDetails true
```

```console
[arthas@56963]$ vmoption PrintGCDetails true
Successfully updated the vm option.
PrintGCDetails=true
```

此时，切换到arthas demo 运行所在的`Terminal`，使用`Ctrl+c`退出，发现比之前多打印了GC垃圾回收信息：

```console
Heap
 def new generation   total 10432K, used 5682K [0x00000000f4800000, 0x00000000f5350000, 0x00000000f8550000)
  eden space 9280K,  61% used [0x00000000f4800000, 0x00000000f4d8cad0, 0x00000000f5110000)
  from space 1152K,   0% used [0x00000000f5110000, 0x00000000f5110000, 0x00000000f5230000)
  to   space 1152K,   0% used [0x00000000f5230000, 0x00000000f5230000, 0x00000000f5350000)
 tenured generation   total 22992K, used 13795K [0x00000000f8550000, 0x00000000f9bc4000, 0x0000000100000000)
   the space 22992K,  59% used [0x00000000f8550000, 0x00000000f92c8cc8, 0x00000000f92c8e00, 0x00000000f9bc4000)
 Metaspace       used 14926K, capacity 15128K, committed 15360K, reserved 1062912K
  class space    used 1895K, capacity 1954K, committed 2048K, reserved 1048576K
```

## 更多信息

在“vmoption”中，我们演示了了Arthas的vmoption命令。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM