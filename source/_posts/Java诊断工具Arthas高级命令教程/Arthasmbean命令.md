---
title: Arthas mbean命令
date: 2021-08-07 09:51:32
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

本教程会以一个简单的应用为例，演示mbean命令。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## Arthas demo

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

## mbean命令

查看 Mbean 的信息

这个命令可以便捷的查看或监控 Mbean 的属性信息。

#### 参数说明

| 参数名称          | 参数说明                                             |
| ----------------- | ---------------------------------------------------- |
| name-pattern      | 名称表达式匹配                                       |
| attribute-pattern | 属性名表达式匹配                                     |
| [m]               | 查看元信息                                           |
| [i:]              | 刷新属性值的时间间隔 (ms)                            |
| [n:]              | 刷新属性值的次数                                     |
| [E]               | 开启正则表达式匹配，默认为通配符匹配。仅对属性名有效 |

### 使用参考

#### 列出所有 Mbean 的名称

```bash
mbean
```

#### 查看 Mbean 的元信息

```bash
mbean -m java.lang:type=Threading
```

#### 查看mbean属性信息

```bash
mbean java.lang:type=Threading 
```

#### mbean的name支持通配符匹配

```bash
mbean java.lang:type=Th*
```

注意：ObjectName 的匹配规则与正常的通配符存在差异，详细参见：[javax.management.ObjectName](https://docs.oracle.com/javase/8/docs/api/javax/management/ObjectName.html?is-external=true)

#### 多属性名称的匹配

查看内存池：

```bash
mbean java.lang:name=*,type=MemoryPool
```

#### 通配符匹配特定的属性字段

```bash
mbean java.lang:type=Threading *Count
```

#### 使用`-E`命令切换为正则匹配

```bash
mbean -E java.lang:type=Threading PeakThreadCount|ThreadCount|DaemonThreadCount
```

查看内存池：

```bash
mbean -E java.lang:name=*,type=MemoryPool Name|Usage|Type | grep " HEAP" -A3 -B1
```

#### 使用`-i`命令实时监控

```bash
mbean -i 1000 java.lang:type=Threading *Count
```

## 更多信息

在“mbean”中，我们演示了了Arthas的mbean命令。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM