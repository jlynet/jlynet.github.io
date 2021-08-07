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
java -jar arthas-boot.jar $(ps -ef |grep $USER| grep "PortalWebMain"| grep 8001 | grep -v grep | awk '{print $2}')
```

arthas-client:
```language
java -jar arthas-client.jar -h
java -jar arthas-client.jar 127.0.0.1 3658
java -jar arthas-client.jar -c 'dashboard -n 1'
java -jar arthas-client.jar -f batch.as 127.0.0.1
```