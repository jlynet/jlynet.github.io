---
title: Arthas安装使用
date: 2021-07-30 18:12:31
categories: [java技术栈]
tags: [技术笔记,java]
---


arthas-boot:
```language
java -jar arthas-boot.jar -h
java -jar arthas-boot.jar #选择进程号
java -jar arthas-boot.jar 18095 #指定进程号
```

arthas-client:
```language
java -jar arthas-client.jar -h
java -jar arthas-client.jar 127.0.0.1 3658
java -jar arthas-client.jar -c 'dashboard -n 1'
java -jar arthas-client.jar -f batch.as 127.0.0.1
```

使用 dashboard 可以实时显示线程，内存，GC，运行环境信息
```language
[arthas@32344]$ dashboard
```

到出内存快照dump文件
```language
[arthas@32344]$ heapdump --live /root/jvm.hprof
```

查看慢方法 
命令:`trace 类路径 类方法名`
```language
[arthas@32344]$ trace com.sinovatech.gxhzg.web.edge.open.api.nav.OpenNav1001v1 execute
```

查看方法耗时
命令 ：`tt -t 类路径 类方法名`
```language
[arthas@32344]$ tt -t com.sinovatech.gxhzg.web.edge.open.api.nav.OpenNav1001v1 execute
Press Q or Ctrl+C to abort.
Affect(class count: 1 , method count: 1) cost in 708 ms, listenerId: 1
```

查看所有线程状态
命令: `thread` 
```language
[arthas@32344]$ thread
```

查看阻塞的线程
命令: `thread -b`
```language
[arthas@32344]$ thread -b
```

查看占用cpu最高的前number个线程
命令: `thread -n [number]`
```language
[arthas@32344]$ thread -n 5
```

查看指定线程
命名: `thread [threadId]`
```language
[arthas@32344]$ thread 110
```

反编译类
命名: `jad 类全路径`
```language
[arthas@32344]$ jad java.util.concurrent.locks.AbstractQueuedSynchronizer
```

文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM