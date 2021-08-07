---
title: Arthas Http API案例
date: 2021-08-07 08:35:35
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

本教程会以一个简单的应用为例，演示http-api案例。

- Github: https://github.com/alibaba/arthas
- 文档: https://arthas.aliyun.com/doc

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

## Http API

### 此教程暂时无法在Handson环境下运行,同学们可以在本地尝试

#### 概览

Http API 提供类似RESTful的交互接口，请求和响应均为JSON格式的数据。相对于Telnet/WebConsole的输出非结构化文本数据，Http API可以提供结构化的数据，支持更复杂的交互功能，比如特定应用场景的一系列诊断操作。

##### 访问地址

Http API接口地址为：`http://ip:port/api`，必须使用POST方式提交请求参数。如POST `http://127.0.0.1:8563/api` 。

注意：telnet服务的3658端口与Chrome浏览器有兼容性问题，建议使用http端口8563来访问http接口。

##### 请求数据格式

```json
{
  "action": "exec",
  "requestId": "req112",
  "sessionId": "94766d3c-8b39-42d3-8596-98aee3ccbefb",
  "consumerId": "955dbd1325334a84972b0f3ac19de4f7_2",
  "command": "version",
  "execTimeout": "10000"
}
```


请求数据格式说明：

- `action` : 请求的动作/行为，可选值请参考"请求Action"小节。
- `requestId` : 可选请求ID，由客户端生成。
- `sessionId` : Arthas会话ID，一次性命令不需要设置会话ID。
- `consumerId` : Arthas消费者ID，用于多人共享会话。
- `command` : Arthas command line 。
- `execTimeout` : 命令同步执行的超时时间(ms)，默认为30000。

注意: 不同的action使用到参数不同，根据具体的action来设置参数。

##### 请求Action

目前支持的请求Action如下：

- `exec` : 同步执行命令，命令正常结束或者超时后中断命令执行后返回命令的执行结果。
- `async_exec` : 异步执行命令，立即返回命令的调度结果，命令执行结果通过`pull_results`获取。
- `interrupt_job` : 中断会话当前的命令，类似Telnet `Ctrl + c`的功能。
- `pull_results` : 获取异步执行的命令的结果，以http 长轮询（long-polling）方式重复执行
- `init_session` : 创建会话
- `join_session` : 加入会话，用于支持多人共享同一个Arthas会话
- `close_session` : 关闭会话

##### 响应状态

响应中的state属性表示请求处理状态，取值如下：

- `SCHEDULED`：异步执行命令时表示已经创建job并已提交到命令执行队列，命令可能还没开始执行或者执行中；
- `SUCCEEDED`：请求处理成功（完成状态）；
- `FAILED`：请求处理失败（完成状态），通常附带message说明原因；
- `REFUSED`：请求被拒绝（完成状态），通常附带message说明原因；

## 一次性命令

与执行批处理命令类似，一次性命令以同步方式执行。不需要创建会话，不需要设置`sessionId`选项。

```json
{
  "action": "exec",
  "command": "<Arthas command line>"
}
```


比如获取Arthas版本号：

`curl -Ss -XPOST http://localhost:8563/api -d ';{ "action":"exec", "command":"version" }`

```bash
' | json_pp
```


响应内容如下：

```json
{
   "state" : "SUCCEEDED",
   "sessionId" : "ee3bc004-4586-43de-bac0-b69d6db7a869",
   "body" : {
      "results" : [
         {
            "type" : "version",
            "version" : "3.3.7",
            "jobId" : 5
         },
         {
            "jobId" : 5,
            "statusCode" : 0,
            "type" : "status"
         }
      ],
      "timeExpired" : false,
      "command" : "version",
      "jobStatus" : "TERMINATED",
      "jobId" : 5
   }
}
```


响应数据解析：

- `state`: 请求处理状态，参考“接口响应状态”说明
- `sessionId`: Arthas会话ID，一次性命令自动创建及销毁临时会话
- `body.jobId`: 命令的任务ID，同一任务输出的所有Result都是相同的jobId
- `body.jobStatus`: 任务状态，同步执行正常结束为`TERMINATED`
- `body.timeExpired`: 任务执行是否超时
- `body/results`: 命令执行的结果列表

**命令结果格式说明**

```json
 [{
    "type" : "version",
    "version" : "3.3.7",
    "jobId" : 5
 },
 {
    "jobId" : 5,
    "statusCode" : 0,
    "type" : "status"
 }]
```


- `type` : 命令结果类型，除了`status`等特殊的几个外，其它的保持与Arthas命令名称一致。请参考"特殊命令结果"小节。
- `jobId` : 处理命令的任务ID。
- 其它字段为每个不同命令的数据。

注意：也可以使用一次性命令的方式执行watch/trace等连续输出的命令，但不能中断命令执行，可能出现长时间没有结束的问题。请参考"watch命令输出map对象"小节的示例。

请尽量按照以下方式处理：

- 设置合理的`execTimeout`，到达超时时间后强制中断命令执行，避免长时间挂起。
- 通过`-n`参数指定较少的执行次数。
- 保证命令匹配的方法可以成功命中和condition-express编写正确，如果watch/trace没有命中就算指定`-n 1`也会挂起等待到执行超时。

## 会话交互

由用户创建及管理Arthas会话，适用于复杂的交互过程。访问流程如下：

- 创建会话
- 加入会话(可选）
- 拉取命令结果
- 执行一系列命令
- 中断命令执行
- 关闭会话

##### 创建会话

创建会话, 保存输出到bash环境变量

`session*data=$(curl -Ss -XPOST http://localhost:8563/api -d ';{ "action":"init*session" } ')`

```bash
echo $session_data | json_pp
```


注： `json_pp` 工具将输出内容格式化为pretty json。

响应结果：

```json
{
   "sessionId" : "b09f1353-202c-407b-af24-701b744f971e",
   "consumerId" : "5ae4e5fbab8b4e529ac404f260d4e2d1_1",
   "state" : "SUCCEEDED"
}
```


提取会话ID和消费者ID。

当前会话ID为：

```bash
session_id=$(echo $session_data | sed 's/.*"sessionId":"\([^"]*\)".*/\1/g');echo $session_id
```


`b09f1353-202c-407b-af24-701b744f971e`;

请记下这里的会话ID，在Terminal 4中需要手动输入。

当前消费者ID为：

```bash
consumer_id=$(echo $session_data | sed 's/.*"consumerId":"\([^"]*\)".*/\1/g');echo $consumer_id
```

`5ae4e5fbab8b4e529ac404f260d4e2d1_1`。

##### 加入会话

指定要加入的会话ID，服务端将分配一个新的消费者ID。多个消费者可以接收到同一个会话的命令结果。本接口用于支持多人共享同一个会话或刷新页面后重新拉取会话历史记录。

加入会话，保存输出到bash环境变量

`session*data=$(curl -Ss -XPOST http://localhost:8563/api -d ';{ "action":"join*session", "sessionId" : "'"$session_id"'" } ')`

```bash
echo $session_data | json_pp
```


响应结果：

```json
{
   "consumerId" : "8f7f6ad7bc2d4cb5aa57a530927a95cc_2",
   "sessionId" : "b09f1353-202c-407b-af24-701b744f971e",
   "state" : "SUCCEEDED"
}
```


提取消费者ID。

新的消费者ID为

```bash
consumer_id=$(echo $session_data | sed 's/.*"consumerId":"\([^"]*\)".*/\1/g');echo $consumer_id
```

`8f7f6ad7bc2d4cb5aa57a530927a95cc_2` 。

请记下这里的消费者ID，在Terminal 4中需要手动输入。

##### 拉取命令结果

拉取命令结果消息的action为`pull_results`。请使用Http long-polling方式，定时循环拉取结果消息。 消费者的超时时间为5分钟，超时后需要调用`join_session`分配新的消费者。每个消费者单独分配一个缓存队列，按顺序拉取命令结果，不会影响到其它消费者。

请求参数需要指定会话ID及消费者ID:

`curl -Ss -XPOST http://localhost:8563/api -d ';{ "action":"pull*results", "sessionId" : "'"$session*id"'", "consumerId" : "'"$consumer_id"'" }`

```bash
' | json_pp
```

用Bash脚本定时拉取结果消息:

请在Terminal 4中输入Terminal 3中的会话ID，这里的例子如下：

```
b09f1353-202c-407b-af24-701b744f971e
echo -n "Enter your sessionId in T3:";read  session_id
```


同样，接着输入Terminal 3中的消费者ID，这里的例子如下：

```
8f7f6ad7bc2d4cb5aa57a530927a95cc_2
echo -n "Enter your consumerId in T3:";read  consumer_id
```

`while true; do curl -Ss -XPOST http://localhost:8563/api -d ';{ "action":"pull*results", "sessionId" : "'"$session*id"'", "consumerId" : "'"$consumer_id"'" }`

```bash
' | json_pp; sleep 2; done
```

响应内容如下：

```json
{
   "body" : {
      "results" : [
         {
            "inputStatus" : "DISABLED",
            "jobId" : 0,
            "type" : "input_status"
         },
         {
            "type" : "message",
            "jobId" : 0,
            "message" : "Welcome to arthas!"
         },
         {
            "tutorials" : "https://arthas.aliyun.com/doc/arthas-tutorials.html",
            "time" : "2020-08-06 15:56:43",
            "type" : "welcome",
            "jobId" : 0,
            "pid" : "7909",
            "wiki" : "https://arthas.aliyun.com/doc",
            "version" : "3.3.7"
         },
         {
            "inputStatus" : "ALLOW_INPUT",
            "type" : "input_status",
            "jobId" : 0
         }
      ]
   },
   "sessionId" : "b09f1353-202c-407b-af24-701b744f971e",
   "consumerId" : "8f7f6ad7bc2d4cb5aa57a530927a95cc_2",
   "state" : "SUCCEEDED"
}
```

##### 异步执行命令

`curl -Ss -XPOST http://localhost:8563/api -d ''';{ "action":"async*exec", "command":"watch demo.MathGame primeFactors \"{params, returnObj, throwExp}\" ", "sessionId" : "'"$session*id"'" }`

```bash
''' | json_pp
```


`async_exec` 的结果：

```json
{
   "sessionId" : "2b085b5d-883b-4914-ab35-b2c5c1d5aa2a",
   "state" : "SCHEDULED",
   "body" : {
      "jobStatus" : "READY",
      "jobId" : 3,
      "command" : "watch demo.MathGame primeFactors \"{params, returnObj, throwExp}\" "
   }
}
```


- `state` : `SCHEDULED` 状态表示已经解析命令生成任务，但未开始执行。
- `body.jobId` : 异步执行命令的任务ID，可以根据此任务ID来过滤在`pull_results`输出的命令结果。
- `body.jobStatus` : 任务状态`READY`表示未开始执行。 切换到上面自动拉取结果消息脚本的shell（Terminal 4），查看输出：

```json
{
   "body" : {
      "results" : [
         {
            "type" : "command",
            "jobId" : 3,
            "state" : "SCHEDULED",
            "command" : "watch demo.MathGame primeFactors \"{params, returnObj, throwExp}\" "
         },
         {
            "inputStatus" : "ALLOW_INTERRUPT",
            "jobId" : 0,
            "type" : "input_status"
         },
         {
            "success" : true,
            "jobId" : 3,
            "effect" : {
               "listenerId" : 3,
               "cost" : 24,
               "classCount" : 1,
               "methodCount" : 1
            },
            "type" : "enhancer"
         },
         {
            "sizeLimit" : 10485760,
            "expand" : 1,
            "jobId" : 3,
            "type" : "watch",
            "cost" : 0.071499,
            "ts" : 1596703453237,
            "value" : [
               [
                  -170365
               ],
               null,
               {
                  "stackTrace" : [
                     {
                        "className" : "demo.MathGame",
                        "classLoaderName" : "app",
                        "methodName" : "primeFactors",
                        "nativeMethod" : false,
                        "lineNumber" : 46,
                        "fileName" : "MathGame.java"
                     },
                     ...
                  ],
                  "localizedMessage" : "number is: -170365, need >= 2",
                  "@type" : "java.lang.IllegalArgumentException",
                  "message" : "number is: -170365, need >= 2"
               }
            ]
         },
         {
            "type" : "watch",
            "cost" : 0.033375,
            "jobId" : 3,
            "ts" : 1596703454241,
            "value" : [
               [
                  1
               ],
               [
                  2,
                  2,
                  2,
                  2,
                  13,
                  491
               ],
               null
            ],
            "sizeLimit" : 10485760,
            "expand" : 1
         }
      ]
   },
   "consumerId" : "8ecb9cb7c7804d5d92e258b23d5245cc_1",
   "sessionId" : "2b085b5d-883b-4914-ab35-b2c5c1d5aa2a",
   "state" : "SUCCEEDED"
}
```


watch命令结果的`value`为watch-experss的值，上面命令中为`{params, returnObj, throwExp}`，所以watch结果的value为一个长度为3的数组，每个元素分别对应相应顺序的表达式。 请参考"watch命令输出map对象"小节。

##### 中断命令执行

中断会话正在运行的前台Job（前台任务）：

`curl -Ss -XPOST http://localhost:8563/api -d ''';{ "action":"interrupt*job", "sessionId" : "'"$session*id"'" }`

```bash
''' | json_pp
```


```json
{
   "state" : "SUCCEEDED",
   "body" : {
      "jobStatus" : "TERMINATED",
      "jobId" : 3
   }
}
```


##### 关闭会话

指定会话ID，关闭会话。

`curl -Ss -XPOST http://localhost:8563/api -d ''';{ "action":"close*session", "sessionId" : "'"$session*id"'" }`

```bash
''' | json_pp
```


```json
{
   "state" : "SUCCEEDED"
}
```


## Web UI

![arthas web ui](arthas-web-ui.png)

一个基于Http API接口实现的Web UI，访问地址为： 。

已实现功能：

- 创建会话
- 复制并打开url加入会话，多人共享会话
- 周期性拉取会话命令结果消息
- 刷新页面或者加入会话拉取会话历史命令消息
- 输入命令/中断命令状态控制

待开发功能：

- 改进将命令结果消息可读性
- 命令输入支持自动完成及命令模板
- 提供命令帮助
- 支持个人选项设置

## watch命令输出map对象

watch的结果值由计算`watch-express` ognl表达式产生，可以通过改变ognl表达式来生成想要的值，请参考[OGNL文档](https://commons.apache.org/proper/commons-ognl/language-guide.html)。

> Maps can also be created using a special syntax.
>
> # { "foo" : "foo value", "bar" : "bar value" }

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM