---
title: Arthas 基础教程
date: 2021-08-07 08:01:39
tags: ['Java 诊断工具 Arthas 入门教程']
---

`Arthas` 是Alibaba开源的Java诊断工具，深受开发者喜爱。在线排查问题，无需重启；动态跟踪Java代码；实时监控JVM状态。

`Arthas` 支持JDK 6+，支持Linux/Mac/Windows，采用命令行交互模式，同时提供丰富的 `Tab` 自动补全功能，进一步方便进行问题的定位和诊断。

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

## Dashboard

`dashboard` 命令可以查看当前系统的实时数据面板。

```bash
dashboard
```

输入 `q` 或者 `Ctrl+C` 可以退出dashboard命令。

```bash
q
```

## Thread

`thread 1` 命令会打印线程ID 1的栈。

```bash
thread 1
```

Ctrl+C Arthas支持管道，可以用 `thread 1 | grep 'main('` 查找到`main class`。

```bash
thread 1 | grep 'main('
```

可以看到`main class`是`demo.MathGame`：

```
$ thread 1 | grep 'main('
    at demo.MathGame.main(MathGame.java:17)
```

## Sc

可以通过 `sc` 命令来查找JVM里已加载的类：

```bash
sc -d *MathGame
```

## Jad

可以通过 `jad` 命令来反编译代码：

```bash
jad demo.MathGame
```

## Watch

通过`watch`命令可以查看函数的参数/返回值/异常信息。

```bash
watch demo.MathGame primeFactors returnObj
```



输入 `q` 或者 `Ctrl+C` 退出watch命令。

```bash
q
```

## Exit/Stop

### 退出Arthas

用 `exit` 或者 `quit` 命令可以退出Arthas。

```bash
exit
```

Ctrl+C

退出Arthas之后，还可以再次用 `java -jar arthas-boot.jar` 来连接。

```bash
java -jar arthas-boot.jar
```

Ctrl+C

### 彻底退出Arthas

`exit/quit`命令只是退出当前session，arthas server还在目标进程中运行。

想完全退出Arthas，可以执行 `stop` 命令。

```bash
stop
```

Ctrl+C

## 更多信息

通过本教程基本掌握了Arthas的用法。更多高级特性，可以在下面的进阶指南里继续了解。

- [Arthas进阶](https://arthas.aliyun.com/doc/arthas-tutorials.html?language=cn&id=arthas-advanced)
- [Arthas Github](https://github.com/alibaba/arthas)
- [Arthas 文档](https://arthas.aliyun.com/doc/)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=qDlgqpBT