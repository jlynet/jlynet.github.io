---
title: Arthas sc命令
date: 2021-08-07 09:51:42
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

本教程会以一个简单的应用为例，演示sc命令。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc/

## 启动arthas demo

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

## sc命令

> 查看JVM已加载的类信息

“Search-Class” 的简写，这个命令能搜索出所有已经加载到 JVM 中的 Class 信息，这个命令支持的参数有 `[d]`、`[E]`、`[f]` 和 `[x:]`。

## 参数说明

#### 参数说明

| 参数名称              | 参数说明                                                     |
| --------------------- | ------------------------------------------------------------ |
| *class-pattern*       | 类名表达式匹配                                               |
| *method-pattern*      | 方法名表达式匹配                                             |
| [d]                   | 输出当前类的详细信息，包括这个类所加载的原始文件来源、类的声明、加载的ClassLoader等详细信息。 如果一个类被多个ClassLoader所加载，则会出现多次 |
| [E]                   | 开启正则表达式匹配，默认为通配符匹配                         |
| [f]                   | 输出当前类的成员变量信息（需要配合参数-d一起使用）           |
| [x:]                  | 指定输出静态变量时属性的遍历深度，默认为 0，即直接使用 `toString` 输出 |
| `[c:]`                | 指定class的 ClassLoader 的 hashcode                          |
| `[classLoaderClass:]` | 指定执行表达式的 ClassLoader 的 class name                   |
| `[n:]`                | 具有详细信息的匹配类的最大数量（默认为100）                  |

> class-pattern支持全限定名，如com.taobao.test.AAA，也支持com/taobao/test/AAA这样的格式，这样，我们从异常堆栈里面把类名拷贝过来的时候，不需要在手动把`/`替换为`.`啦。
>
> sc 默认开启了子类匹配功能，也就是说所有当前类的子类也会被搜索出来，想要精确的匹配，请打开`options disable-sub-class true`开关

#### 使用参考

- 模糊搜索

  `sc demo.*`

```bash
sc demo.*
```

```console
  $ sc demo.*
  demo.MathGame
  Affect(row-cnt:1) cost in 55 ms.
```

- 打印类的详细信息

  `sc -d demo.MathGame`

```bash
sc -d demo.MathGame
```

```console
  $ sc -d demo.MathGame
  class-info        demo.MathGame
  code-source       /private/tmp/arthas-demo.jar
  name              demo.MathGame
  isInterface       false
  isAnnotation      false
  isEnum            false
  isAnonymousClass  false
  isArray           false
  isLocalClass      false
  isMemberClass     false
  isPrimitive       false
  isSynthetic       false
  simple-name       MathGame
  modifier          public
  annotation
  interfaces
  super-class       +-java.lang.Object
  class-loader      +-sun.misc.Launcher$AppClassLoader@3d4eac69
                      +-sun.misc.Launcher$ExtClassLoader@66350f69
  classLoaderHash   3d4eac69

  Affect(row-cnt:1) cost in 875 ms.
```

- 指定classLoader

注意hashcode是变化的，需要先查看当前的ClassLoader信息，提取对应ClassLoader的hashcode。

如果你使用`-c`，你需要手动输入hashcode：`-c <hashcode>`

```console
$ sc -c 3d4eac69 -d demo*
```

对于只有唯一实例的ClassLoader可以通过`--classLoaderClass`指定class name，使用起来更加方便：

```bash
sc --classLoaderClass sun.misc.Launcher$AppClassLoader -d demo*
```

- 注: 这里classLoaderClass 在 java 8 是 sun.misc.Launcher$AppClassLoader，而java 11的classloader是jdk.internal.loader.ClassLoaders$AppClassLoader，katacoda目前环境是java8。

`--classLoaderClass` 的值是ClassLoader的类名，只有匹配到唯一的ClassLoader实例时才能工作，目的是方便输入通用命令，而`-c <hashcode>`是动态变化的。

- 打印出类的Field信息

  `sc -d -f demo.MathGame`

```bash
sc -d -f demo.MathGame
```

```console
  $ sc -d -f demo.MathGame
  class-info        demo.MathGame
  code-source       /private/tmp/arthas-demo.jar
  name              demo.MathGame
  isInterface       false
  isAnnotation      false
  isEnum            false
  isAnonymousClass  false
  isArray           false
  isLocalClass      false
  isMemberClass     false
  isPrimitive       false
  isSynthetic       false
  simple-name       MathGame
  modifier          public
  annotation
  interfaces
  super-class       +-java.lang.Object
  class-loader      +-sun.misc.Launcher$AppClassLoader@3d4eac69
                      +-sun.misc.Launcher$ExtClassLoader@66350f69
  classLoaderHash   3d4eac69
  fields            modifierprivate,static
                    type    java.util.Random
                    name    random
                    value   java.util.Random@522b4
                            08a

                    modifierprivate
                    type    int
                    name    illegalArgumentCount
  Affect(row-cnt:1) cost in 19 ms.
```

## 更多信息

在“sc”中，我们演示了了Arthas的sc命令。如果有更多的技巧或者使用疑问，欢迎在Issue里提出。

- Issues: https://github.com/alibaba/arthas/issues
- 文档： https://arthas.aliyun.com/doc

如果您在使用Arthas，请让我们知道。您的使用对我们非常重要：[查看](https://github.com/alibaba/arthas/issues/111)

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM