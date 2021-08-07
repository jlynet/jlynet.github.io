---
title: Arthas 排查函数调用异常 案例
date: 2021-08-07 08:35:39
tags: ['Java 诊断工具 Arthas 最佳实践']
---

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

本教程会以一个普通的Spring Boot应用为例，演示排查函数调用异常。

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

## 排查函数调用异常

#### 现象

目前，访问 http://localhost:61000/user/0 ，会返回500异常：

```bash
curl http://localhost:61000/user/0
```



```
{"timestamp":1550223186170,"status":500,"error":"Internal Server Error","exception":"java.lang.IllegalArgumentException","message":"id < 1","path":"/user/0"}
```



但请求的具体参数，异常栈是什么呢？

#### 查看UserController的 参数/异常

在Arthas里执行：

```bash
watch com.example.demo.arthas.user.UserController * '{params, throwExp}'
```



1. 第一个参数是类名，支持通配
2. 第二个参数是函数名，支持通配 访问 `curl http://localhost:61000/user/0` ,`watch`命令会打印调用的参数和异常

```bash
curl http://localhost:61000/user/0
```



```console
$ watch com.example.demo.arthas.user.UserController * '{params, throwExp}'
Press Q or Ctrl+C to abort.
Affect(class-cnt:1 , method-cnt:2) cost in 53 ms.
ts=2019-02-15 01:35:25; [cost=0.996655ms] result=@ArrayList[
    @Object[][isEmpty=false;size=1],
    @IllegalArgumentException[java.lang.IllegalArgumentException: id < 1],
]
```

可以看到实际抛出的异常是`IllegalArgumentException`。

可以输入 `q` 或者 `Ctrl+C` 退出watch命令。

```bash
q
```



如果想把获取到的结果展开，可以用`-x`参数：

```bash
watch com.example.demo.arthas.user.UserController * '{params, throwExp}' -x 2
```



```console
$ watch com.example.demo.arthas.user.UserController * '{params, throwExp}' -x 2
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 2) cost in 190 ms, listenerId: 1
ts=2020-08-13 05:22:45; [cost=4.805432ms] result=@ArrayList[
    @Object[][
        @Integer[0],
    ],
    java.lang.IllegalArgumentException: id < 1
        at com.example.demo.arthas.user.UserController.findUserById(UserController.java:19)
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    ...
,
]
```

#### 返回值表达式

在上面的例子里，第三个参数是`返回值表达式`，它实际上是一个`ognl`表达式，它支持一些内置对象：

- loader
- clazz
- method
- target
- params
- returnObj
- throwExp
- isBefore
- isThrow
- isReturn

你可以利用这些内置对象来组成不同的表达式。比如返回一个数组：

```bash
watch com.example.demo.arthas.user.UserController * '{params[0], target, returnObj}'
```



更多参考： https://arthas.aliyun.com/doc/advice-class.html

#### 条件表达式

`watch`命令支持在第4个参数里写条件表达式，比如：

```bash
watch com.example.demo.arthas.user.UserController * returnObj 'params[0] > 100'
```



当访问 user/1 时，`watch`命令没有输出

当访问 user/101 时，`watch`会打印出结果。

```console
$ watch com.example.demo.arthas.user.UserController * returnObj 'params[0] > 100'
Press Q or Ctrl+C to abort.
Affect(class-cnt:1 , method-cnt:2) cost in 47 ms.
ts=2019-02-13 19:42:12; [cost=0.821443ms] result=@User[
    id=@Integer[101],
    name=@String[name101],
]
```

#### 当异常时捕获

`watch`命令支持`-e`选项，表示只捕获抛出异常时的请求：

```bash
watch com.example.demo.arthas.user.UserController * "{params[0],throwExp}" -e
```



#### 按照耗时进行过滤

watch命令支持按请求耗时进行过滤，比如：

```bash
watch com.example.demo.arthas.user.UserController * '{params, returnObj}' '#cost>200'
```



## 更多信息

通过本教程基本掌握了Arthas排查函数调用异常。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM