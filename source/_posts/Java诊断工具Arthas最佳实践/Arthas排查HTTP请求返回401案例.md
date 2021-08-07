---
title: Arthas 排查HTTP请求返回401 案例
date: 2021-08-07 08:35:34
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

本教程会以一个普通的Spring Boot应用为例，演示排查HTTP请求返回401。

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

## 排查HTTP请求返回401

在这个案例里，展示排查HTTP 401问题的技巧。

访问： admin

结果是：

```
Something went wrong: 401 Unauthorized
```


我们知道`401`通常是被权限管理的`Filter`拦截了，那么到底是哪个`Filter`处理了这个请求，返回了401？

#### 跟踪所有的Filter函数

开始trace：

```bash
trace javax.servlet.Filter *
```


访问： admin

可以在调用树的最深层，找到`AdminFilterConfig$AdminFilter`返回了`401`：

```
+---[3.806273ms] javax.servlet.FilterChain:doFilter()
|   `---[3.447472ms] com.example.demo.arthas.AdminFilterConfig$AdminFilter:doFilter()
|       `---[0.17259ms] javax.servlet.http.HttpServletResponse:sendError()
```


#### 通过stack获取调用栈

上面是通过`trace`命令来获取信息，从结果里，我们可以知道通过`stack`跟踪`HttpServletResponse:sendError()`，同样可以知道是哪个`Filter`返回了`401`

执行：

```bash
stack javax.servlet.http.HttpServletResponse sendError 'params[0]==401'
```


访问： admin

```console
$ stack javax.servlet.http.HttpServletResponse sendError 'params[0]==401'
Press Q or Ctrl+C to abort.
Affect(class-cnt:2 , method-cnt:4) cost in 87 ms.
ts=2019-02-15 16:44:06;thread_name=http-nio-8080-exec-6;id=16;is_daemon=true;priority=5;TCCL=org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedWebappClassLoader@8546cd5
    @org.apache.catalina.connector.ResponseFacade.sendError()
        at com.example.demo.arthas.AdminFilterConfig$AdminFilter.doFilter(AdminFilterConfig.java:38)
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193)
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:166)
        at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:99)
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:107)
```

## 更多信息

通过本教程基本掌握了Arthas排查HTTP请求返回401。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM