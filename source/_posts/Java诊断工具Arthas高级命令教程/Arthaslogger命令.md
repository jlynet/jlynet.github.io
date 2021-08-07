---
title: Arthas logger命令
date: 2021-08-07 09:51:31
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

本教程会以一个普通的Spring Boot应用为例，演示logger命令。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## 启动demo

下载`demo-arthas-spring-boot.jar`，再用`java -jar`命令启动：

```bash
wget https://code.aliyun.com/middleware-container/handsonLabExternedFiles/raw/master/demo-arthas-spring-boot.jar;java -jar demo-arthas-spring-boot.jar
```

`demo-arthas-spring-boot`是一个很简单的spring boot应用，源代码：[查看](https://github.com/hengyunabc/spring-boot-inside/tree/master/demo-arthas-spring-boot)

启动之后，可以访问61000端口： 点击查看

![Demo Web](https://img.alicdn.com/imgextra/i2/O1CN010Qbzcz1ctPSWSZI6L_!!6000000003658-2-tps-333-182.png)

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

## logger命令

查看logger信息，更新logger level

#### 使用参考

##### 查看所有logger信息

```bash
logger
```

```console
[arthas@2062]$ logger
 name              ROOT
 class             ch.qos.logback.classic.Logger
 classLoader       org.springframework.boot.loader.LaunchedURLClassLoader@5674cd4d
 classLoaderHash   5674cd4d
 level             INFO
 effectiveLevel    INFO
 additivity        true
 codeSource        jar:file:/home/scrapbook/tutorial/demo-arthas-spring-boot.jar!/BOOT-INF/lib/logback-classi
                   c-1.1.11.jar!/
 appenders         name            CONSOLE
                   class           ch.qos.logback.core.ConsoleAppender
                   classLoader     org.springframework.boot.loader.LaunchedURLClassLoader@5674cd4d
                   classLoaderHash 5674cd4d
                   target          System.out
...
```

##### 查看指定名字的logger信息

```bash
logger -n org.springframework.web
```

```console
[arthas@2062]$ logger -n org.springframework.web
 name              org.springframework.web
 class             ch.qos.logback.classic.Logger
 classLoader       org.springframework.boot.loader.LaunchedURLClassLoader@5674cd4d
 classLoaderHash   5674cd4d
 level             null
 effectiveLevel    INFO
 additivity        true
 codeSource        jar:file:/home/scrapbook/tutorial/demo-arthas-spring-boot.jar!/BOOT-INF/lib/logback-classi
                   c-1.1.11.jar!/
```

请记下你的classLoaderHash，后面需要使用它。在这里，它是 `5674cd4d`。

注意：请使用你的classLoaderHash值覆盖 `<classLoaderHash>` ，然后手动执行下面所述命令：

##### 查看指定classloader的logger信息

注意hashcode是变化的，需要先查看当前的ClassLoader信息，提取对应ClassLoader的hashcode。

如果你使用`-c`，你需要手动输入hashcode：`-c <hashcode>`

```console
$ logger -c 5674cd4d
```

对于只有唯一实例的ClassLoader可以通过`--classLoaderClass`指定class name，使用起来更加方便：

```bash
logger --classLoaderClass org.springframework.boot.loader.LaunchedURLClassLoader
```

```console
[arthas@2062]$ logger --classLoaderClass org.springframework.boot.loader.LaunchedURLClassLoader
name              ROOT
 class             ch.qos.logback.classic.Logger
 classLoader       org.springframework.boot.loader.LaunchedURLClassLoader@5674cd4d
 classLoaderHash   5674cd4d
 level             INFO
 effectiveLevel    INFO
 additivity        true
 codeSource        jar:file:/home/scrapbook/tutorial/demo-arthas-spring-boot.jar!/BOOT-INF/lib/logback-classi
                   c-1.1.11.jar!/
 appenders         name            CONSOLE
                   class           ch.qos.logback.core.ConsoleAppender
                   classLoader     org.springframework.boot.loader.LaunchedURLClassLoader@5674cd4d
                   classLoaderHash 5674cd4d
                   target          System.out
...
```

`--classLoaderClass` 的值是ClassLoader的类名，只有匹配到唯一的ClassLoader实例时才能工作，目的是方便输入通用命令，而`-c <hashcode>`是动态变化的。

##### 更新logger level

```bash
logger --name ROOT --level debug
```

```console
[arthas@2062]$ logger --name ROOT --level debug
update logger level success.
```

注意：在教程中执行会提示错误，需要指定classloader

##### 指定classloader更新 logger level

默认情况下，logger命令会在SystemClassloader下执行，如果应用是传统的`war`应用，或者spring boot fat jar启动的应用，那么需要指定classloader。

可以先用 `sc -d yourClassName` 来查看具体的 classloader hashcode，然后在更新level时指定classloader：

```bash
logger --classLoaderClass org.springframework.boot.loader.LaunchedURLClassLoader --name ROOT --level debug
```

```console
[arthas@2062]$ logger --classLoaderClass org.springframework.boot.loader.LaunchedURLClassLoader --name ROOT --level debug
```

##### 查看没有appender的logger的信息

默认情况下，`logger`命令只打印有appender的logger的信息。如果想查看没有`appender`的logger的信息，可以加上参数`--include-no-appender`。

注意，通常输出结果会很长。

```bash
logger --include-no-appender
```

```console
[arthas@2062]$ logger --include-no-appender
 name              org.thymeleaf
 class             ch.qos.logback.classic.Logger
 classLoader       org.springframework.boot.loader.LaunchedURLClassLoader@5674cd4d
 classLoaderHash   5674cd4d
 level             null
 effectiveLevel    INFO
 additivity        false
 codeSource        jar:file:/home/scrapbook/tutorial/demo-arthas-spring-boot.jar!/BOOT-INF/lib/logback-classi
                   c-1.1.11.jar!/
 appenders         name            DEBUG_LEVEL_REMAPPER
                   class           org.springframework.boot.logging.logback.LevelRemappingAppender
                   classLoader     org.springframework.boot.loader.LaunchedURLClassLoader@5674cd4d
                   classLoaderHash 5674cd4d
...
```

## 更多信息

在“logger”中，我们演示了了Arthas的logger命令。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM