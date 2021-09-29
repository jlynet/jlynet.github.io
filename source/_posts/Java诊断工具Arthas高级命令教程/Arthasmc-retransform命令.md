---
title: Arthas mc-retransform命令
date: 2021-08-07 09:51:40
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

本教程会以一个普通的Spring Boot应用为例，演示mc-retransform命令。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## 启动demo

下载`demo-arthas-spring-boot.jar`，再用`java -jar`命令启动：

```bash
wget https://code.aliyun.com/middleware-container/handsonLabExternedFiles/raw/master/demo-arthas-spring-boot.jar;java -jar demo-arthas-spring-boot.jar
```

`demo-arthas-spring-boot`是一个很简单的spring boot应用，源代码：[查看](https://github.com/hengyunabc/spring-boot-inside/tree/master/demo-arthas-spring-boot)

启动之后，可以访问61000端口： 点击查看

![Demo Web](O1CN010Qbzcz1ctPSWSZI6L_!!6000000003658-2-tps-333-182.png)

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

## mc命令

> Memory Compiler/内存编译器，编译`.java`文件生成`.class`。 可以通过`-c`/`--classLoaderClass`参数指定classloader，`-d`参数指定输出目录

编译生成`.class`文件之后，可以结合`retransform`命令实现热更新代码。

## retransform命令

> 加载外部的`.class`文件，retransform jvm已加载的类。

参考：[Instrumentation#retransformClasses](https://docs.oracle.com/javase/8/docs/api/java/lang/instrument/Instrumentation.html#retransformClasses-java.lang.Class…-)

#### 参数说明

| 参数名称              | 参数说明                                   |
| --------------------- | ------------------------------------------ |
| [c:]                  | ClassLoader的hashcode                      |
| `[classLoaderClass:]` | 指定执行表达式的 ClassLoader 的 class name |
| [p:]                  | 外部的`.class`文件的完整路径，支持多个     |

#### retransform的限制

- 不允许新增加field/method
- 正在跑的函数，没有退出不能生效。

## 热更新代码

下面介绍通过`jad`/`mc`/`retransform` 命令实现动态更新代码的功能。

目前，访问 http://localhost:61000/user/0 ，会返回500异常：

```bash
curl http://localhost:61000/user/0
```

```
{"timestamp":1550223186170,"status":500,"error":"Internal Server Error","exception":"java.lang.IllegalArgumentException","message":"id < 1","path":"/user/0"}
```

下面通过热更新代码，修改这个逻辑。

#### jad反编译UserController

```bash
jad --source-only com.example.demo.arthas.user.UserController > /tmp/UserController.java
```

jad反编译的结果保存在 `/tmp/UserController.java`文件里了。

再打开一个`Terminal 3`，然后用vim来编辑`/tmp/UserController.java`：

```bash
vim /tmp/UserController.java
```

比如当 user id 小于1时，也正常返回，不抛出异常：

```java
    @GetMapping(value={"/user/{id}"})
    public User findUserById(@PathVariable Integer id) {
        logger.info("id: {}", (Object)id);
        if (id != null && id < 1) {
            return new User(id, "name" + id);
            // throw new IllegalArgumentException("id < 1");
        }
        return new User(id.intValue(), "name" + id);
    }
```

#### sc查找加载UserController的ClassLoader

```bash
sc -d *UserController | grep classLoaderHash
```

```console
$ sc -d *UserController | grep classLoaderHash
 classLoaderHash   1be6f5c3
```

可以发现是 spring boot `LaunchedURLClassLoader@1be6f5c3` 加载的。

注意hashcode是变化的，需要先查看当前的ClassLoader信息，提取对应ClassLoader的hashcode。

如果你使用`-c`，你需要手动输入hashcode：`-c <hashcode>`

对于只有唯一实例的ClassLoader可以通过`--classLoaderClass`指定class name，使用起来更加方便.

`--classLoaderClass` 的值是ClassLoader的类名，只有匹配到唯一的ClassLoader实例时才能工作，目的是方便输入通用命令，而`-c <hashcode>`是动态变化的。

#### mc

保存好`/tmp/UserController.java`之后，使用`mc`(Memory Compiler)命令来编译，并且通过`--classLoaderClass`参数指定ClassLoader：

```bash
mc --classLoaderClass org.springframework.boot.loader.LaunchedURLClassLoader /tmp/UserController.java -d /tmp
```

```console
$ mc --classLoaderClass org.springframework.boot.loader.LaunchedURLClassLoader /tmp/UserController.java -d /tmp
Memory compiler output:
/tmp/com/example/demo/arthas/user/UserController.class
Affect(row-cnt:1) cost in 346 ms
```

也可以通过`mc -c <classLoaderHash> /tmp/UserController.java -d /tmp`，使用`-c`参数指定ClassLoaderHash:

```console
$ mc -c 1be6f5c3 /tmp/UserController.java -d /tmp
```

#### retransform

再使用`retransform`命令重新加载新编译好的`UserController.class`：

```bash
retransform /tmp/com/example/demo/arthas/user/UserController.class
```

```
$ retransform /tmp/com/example/demo/arthas/user/UserController.class
retransform success, size: 1
```

#### 热修改代码结果

`retransform`成功之后，再次访问 user/0 ，结果是：

```
{
  "id": 0,
  "name": "name0"
}
```

## retransform命令更多说明

> 加载外部的`.class`文件，retransform jvm已加载的类。

参考：[Instrumentation#retransformClasses](https://docs.oracle.com/javase/8/docs/api/java/lang/instrument/Instrumentation.html#retransformClasses-java.lang.Class…-)

#### 查看 retransform entry

```bash
retransform -l
```

```console
$ retransform -l
Id              ClassName       TransformCount  LoaderHash      LoaderClassName
1               com.example.dem 1               null            null
                o.arthas.user.U
                serController
```

- TransformCount 统计在 ClassFileTransformer#transform 函数里尝试返回 entry对应的 .class文件的次数，但并不表明transform一定成功。

#### 删除指定 retransform entry

```bash
retransform -d 1
```

需要指定 id：

```console
retransform -d 1
```

#### 删除所有 retransform entry

```bash
retransform --deleteAll
```

```console
retransform --deleteAll
```

#### 显式触发 retransform

```bash
retransform --classPattern com.example.demo.arthas.user.UserController
```

```console
$ retransform --classPattern com.example.demo.arthas.user.UserController
retransform success, size: 1, classes:
com.example.demo.arthas.user.UserController
```

> 注意：对于同一个类，当存在多个 retransform entry时，如果显式触发 retransform ，则最后添加的entry生效(id最大的)。

#### 消除 retransform 的影响

如果对某个类执行 retransform 之后，想消除影响，则需要：

- 删除这个类对应的 retransform entry
- 重新触发 retransform

> 如果不清除掉所有的 retransform entry，并重新触发 retransform ，则arthas stop时，retransform过的类仍然生效。

在上面删掉 retransform entry，再显式触发 retransform之后，可以用 `jad`命令来确认之前retransform的结果已经被消除了。

再次访问 user/0 ，会抛出异常。

## 更多信息

在“mc-retransform”中，我们演示了了Arthas的mc-retransform命令。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM