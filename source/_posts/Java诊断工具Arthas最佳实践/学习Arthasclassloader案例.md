---
title: Arthas 理解Spring Boot应用的ClassLoader结构 案例
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

本教程会以一个普通的Spring Boot应用为例，演示Arthas Spring Boot应用的ClassLoader结构。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## Start demo

下载`demo-arthas-spring-boot.jar`，再用`java -jar`命令启动：

```bash
wget https://code.aliyun.com/middleware-container/handsonLabExternedFiles/raw/master/demo-arthas-spring-boot.jar;java -jar demo-arthas-spring-boot.jar
```



`demo-arthas-spring-boot`是一个很简单的spring boot应用，源代码：[查看](https://github.com/hengyunabc/spring-boot-inside/tree/master/demo-arthas-spring-boot)

启动之后，可以访问61000端口： 点击查看

![Demo Web](O1CN010Qbzcz1ctPSWSZI6L_!!6000000003658-2-tps-333-182.png)

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

## 理解Spring Boot应用的ClassLoader结构

下面介绍`classloader`命令的功能。

先访问一个jsp网页，触发jsp的加载： hello

#### 列出所有ClassLoader

```bash
classloader -l
```

```console
$ classloader -l
 name                                                             loadedCount  hash      parent
 BootstrapClassLoader                                             2724         null      null
 com.taobao.arthas.agent.ArthasClassloader@411ce1ab               2009         411ce1ab  sun.misc.Launcher$ExtClassLoader@7494e528
 com.taobao.arthas.agent.ArthasClassloader@22ae1234               1253         22ae1234  sun.misc.Launcher$ExtClassLoader@7494e528
 org.apache.jasper.servlet.JasperLoader@65361d9a                  1            65361d9a  TomcatEmbeddedWebappClassLoader
                                                                                           context: ROOT
                                                                                           delegate: true
                                                                                         ----------> Parent Classloader:
                                                                                         org.springframework.boot.loader.LaunchedURLClassLoader@1be6f5c3

 TomcatEmbeddedWebappClassLoader                                  0            8546cd5   org.springframework.boot.loader.LaunchedURLClassLoader@1be6f5c3
   context: ROOT
   delegate: true
 ----------> Parent Classloader:
 org.springframework.boot.loader.LaunchedURLClassLoader@1be6f5c3

 org.springframework.boot.loader.LaunchedURLClassLoader@1be6f5c3  5416         1be6f5c3  sun.misc.Launcher$AppClassLoader@3d4eac69
 sun.misc.Launcher$AppClassLoader@3d4eac69                        45           3d4eac69  sun.misc.Launcher$ExtClassLoader@7494e528
 sun.misc.Launcher$ExtClassLoader@7494e528                        4            7494e528  null
```

- TomcatEmbeddedWebappClassLoader 加载的class数量是0，所以在spring boot embedded tomcat里，它只是一个空壳，所有的类加载都是`LaunchedURLClassLoader`完成的

请记下你的classLoaderHash，后面需要使用它。在这里，它是 `65361d9a`。

注意：请使用你的classLoaderHash值覆盖 `<classLoaderHash>` ，然后手动执行下面所有所述命令：

#### 列出ClassLoader里加载的所有类

列出上面的`org.apache.jasper.servlet.JasperLoader`加载的类：

```
classloader -a -c <classLoaderHash>
$ classloader -a -c 65361d9a
 hash:1698045338, org.apache.jasper.servlet.JasperLoader@65361d9a
 org.apache.jsp.jsp.hello_jsp
```

#### 查看类的classloader层次

```bash
sc -d org.apache.jsp.jsp.hello_jsp
```

#### 查看ClassLoader树

```bash
classloader -t
```

```
$ classloader -t+-BootstrapClassLoader+-sun.misc.Launcher$ExtClassLoader@28cbbddd  +-com.taobao.arthas.agent.ArthasClassloader@8c25e55  +-sun.misc.Launcher$AppClassLoader@55f96302    +-org.springframework.boot.loader.LaunchedURLClassLoader@1be6f5c3      +-TomcatEmbeddedWebappClassLoader          context: ROOT          delegate: true        ----------> Parent Classloader:        org.springframework.boot.loader.LaunchedURLClassLoader@1be6f5c3        +-org.apache.jasper.servlet.JasperLoader@21ae0fe2
```

#### 查看URLClassLoader实际的urls

比如上面查看到的spring LaunchedURLClassLoader的 hashcode是`1be6f5c3`，可以通过`-c`参数来指定classloader，从而查看URLClassLoader实际的urls：

```
classloader -c <classLoaderHash>$ classloader -c 1be6f5c3jar:file:/home/scrapbook/tutorial/demo-arthas-spring-boot.jar!/BOOT-INF/classes!/jar:file:/home/scrapbook/tutorial/demo-arthas-spring-boot.jar!/BOOT-INF/lib/spring-boot-starter-aop-1.5.13.RELEASE.jar!/...
```

#### 加载指定ClassLoader里的资源文件

查找指定的资源文件： `classloader -c <classLoaderHash> -r logback-spring.xml`

```
$ classloader -c 1be6f5c3 -r logback-spring.xml jar:file:/home/scrapbook/tutorial/demo-arthas-spring-boot.jar!/BOOT-INF/classes!/logback-spring.xml
```

也可以尝试查找类的class文件：

```
classloader -c <classLoaderHash> -r java/lang/String.class$ classloader -c 1b6d3586 -r java/lang/String.class jar:file:/Library/Java/JavaVirtualMachines/jdk1.8.0_60.jdk/Contents/Home/jre/lib/rt.jar!/java/lang/String.class
```

#### 尝试加载指定的类

比如用上面的spring LaunchedURLClassLoader 尝试加载 `ch.qos.logback.classic.spi.StackTraceElementProxy` ：

首先使用`sc ch.qos.logback.classic.spi.StackTraceElementProxy`查看，可发现未加载：

```bash
sc ch.qos.logback.classic.spi.StackTraceElementProxy
```



```console
Affect(row-cnt:0) cost in 18 ms.
```

因而使用spring LaunchedURLClassLoader 尝试加载：

```
classloader -c <classLoaderHash> --load ch.qos.logback.classic.spi.StackTraceElementProxy$ classloader -c 1be6f5c3 --load ch.qos.logback.classic.spi.StackTraceElementProxyload class success. class-info        ch.qos.logback.classic.spi.StackTraceElementProxy code-source       file:/home/scrapbook/tutorial/demo-arthas-spring-boot.jar!/BOOT-INF/lib/logback-classic-1.                   1.11.jar!/ name              ch.qos.logback.classic.spi.StackTraceElementProxy isInterface       false isAnnotation      false isEnum            false isAnonymousClass  false isArray           false isLocalClass      false isMemberClass     false isPrimitive       false isSynthetic       false simple-name       StackTraceElementProxy modifier          public annotation interfaces        java.io.Serializable super-class       +-java.lang.Object class-loader      +-org.springframework.boot.loader.LaunchedURLClassLoader@5674cd4d                     +-sun.misc.Launcher$AppClassLoader@70dea4e                       +-sun.misc.Launcher$ExtClassLoader@56a96482 classLoaderHash   5674cd4d
```

再次使用`sc ch.qos.logback.classic.spi.StackTraceElementProxy`查看，发现已经加载：

```bash
sc ch.qos.logback.classic.spi.StackTraceElementProxy
```

```console
ch.qos.logback.classic.spi.StackTraceElementProxyAffect(row-cnt:1) cost in 19 ms.
```

## 更多信息

通过本教程基本掌握了Arthas Spring Boot应用的ClassLoader结构。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM