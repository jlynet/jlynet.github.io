---
title: awk命令使用介绍
date: 2021-07-31 11:59:37
categories: [linux技术]
tags: [技术笔记,shell,linux]
---


**[awk](https://www.oschina.net/action/GoToLink?url=http%3A%2F%2Fen.wikipedia.org%2Fwiki%2FAwk)** 是一门非常优秀的文本处理工具，甚至可以上升作为一门程序设计语言。
它处理文本的速度是快得惊人的，现在很多基于shell 日志分析工具都可以用它完成。特点是设计简单，速度表现很好，本文将介绍awk内置变量。
格式： awk [ -F re] [parameter...] ['pattern {action}' ] [-f progfile][in_file...]

**一、内置变量**

| **属 性**   | **说 明**                                              |
| ----------- | ------------------------------------------------------ |
| $0          | 当前记录行，代表一行记录                               |
| 1~1 n       | 当前记录的第n个字段，字段间由FS分隔                    |
| FS          | 输入字段分隔符，默认是空格                             |
| NF          | 当前记录中的字段个数，就是有多少列，一般取最后一列字段 |
| NR          | 已经读出的记录数，就是行号，从1开始                    |
| RS          | 输入的记录分隔符，默认为换行符                         |
| OFS         | 输出字段分隔符，默是空格                               |
| ORS         | 输出的记录分隔符，默认为换行符                         |
| ARGC        | 命令行参数个数                                         |
| ARGV        | 命令行参数数组                                         |
| FILENAME    | 当前输入文件的名字                                     |
| IGNORECASE  | 如果为真，则进行忽略大小写的匹配                       |
| ARGIND      | 当前被处理文件的ARGV标志符                             |
| CONVFMT     | 数字转换格式 %.6g                                      |
| ENVIRON     | UNIX环境变量                                           |
| ERRNO       | UNIX系统错误消息                                       |
| FIELDWIDTHS | 输入字段宽度的空白分隔字符串                           |
| FNR         | 当前记录数                                             |
| OFMT        | 数字的输出格式 %.6g                                    |
| RSTART      | 被匹配函数匹配的字符串首                               |
| RLENGTH     | 被匹配函数匹配的字符串长度                             |
| SUBSEP      | \034                                                   |


### Built-in variables

Awk's built-in variables include the field variables: 1,1,2, 3, and so on (3,*a**n**d**s**o**o**n*(0 represents the entire record). They hold the text or values in the individual text-fields in a record.

Other variables include:

- NR: Keeps a current count of the number of input records.
- NF: Keeps a count of the number of fields in an input record. The last field in the input record can be designated by $NF.
- FS: Contains the "field separator" character used to divide fields on the input record. The default, "white space", includes any space and tab characters. FS can be reassigned to another character to change the field separator.
- RS: Stores the current "record separator" character. Since, by default, an input line is the input record, the default record separator character is a "newline".
- OFS: Stores the "output field separator", which separates the fields when Awk prints them. The default is a "space" character.
- ORS: Stores the "output record separator", which separates the output records when Awk prints them. The default is a "newline" character.
- OFMT: Stores the format for numeric output. The default format is "%.6g".
- FILENAME: Contains the name of the current input-file.

**二、 变量实例**
**1） 常用操作**
awk '/^root/ {print $0}' /etc/passwd
结果： root:x:0:0:root:/root:/bin/bash            # /^root/ 为正则过滤表达式，$0代表是逐行

**2） FS 分隔符**
awk 'BEGIN{FS=":"} /^root/ {print 1,1,NF}' /etc/passwd
结果： root /bin/bash       
注： FS为字段分隔符，默认是空格。因为passwd里是”:”分隔，所以需要修改默认分隔符。NF是字段总数，0代表当前行记录，0代表当前行记录，1-n是当前行各个字段对应值，*n*是当前行各个字段对应值，NF代表最后一列。

**3）** **记录条数**（NR，FNR）
awk 'BEGIN{FS=":"}{print NR, 1,1,NF, "\t", $0}' /etc/passwd
结果：
1 root /bin/bash  root:x:0:0:root:/root:/bin/bash
2 daemon /bin/sh  daemon:x:1:1:daemon:/usr/sbin:/bin/sh
3 bin /bin/sh  bin:x:2:2:bin:/bin:/bin/sh
4 sys /bin/sh  sys:x:3:3:sys:/dev:/bin/sh
5 sync /bin/sync  sync:x:4:65534:sync:/bin:/bin/sync

........

awk 'BEGIN{FS=":"}/^s/{print NR, 1,1,NF, "\t", $0}' /etc/passwd          # 过滤以首字符”s“开头的所有行
结果： 
4 sys /bin/sh  sys:x:3:3:sys:/dev:/bin/sh
5 sync /bin/sync  sync:x:4:65534:sync:/bin:/bin/sync
20 syslog /bin/false  syslog:x:101:103::/home/syslog:/bin/false
........
注： NR得到当前记录所在行

**4） 字段分隔符**（OFS）
awk 'BEGIN{FS=":"; OFS="##"} /^root/ {print FNR, 1,1,NF}' /etc/passwd
结果： 1##root##/bin/bash
注： OFS设置默认字段分隔符， FNR当前记录行

**5） 行记录分隔符**（ORS）
awk 'BEGIN{FS=":"; ORS="##"}{print FNR, 1,1,NF}' /etc/passwd
结果： 1 root /bin/bash##2 daemon /bin/sh##3 bin /bin/sh##4 sys /bin/sh##5 sync /bin/sync##......
awk 'BEGIN{FS=":"; ORS="\n"}{print FNR, 1,1,NF}' /etc/passwd          #   "/n" 是linux 中换行符
结果：
1 root /bin/bash
2 daemon /bin/sh
3 bin /bin/sh
4 sys /bin/sh
5 sync /bin/sync
.......
注： ORS默认是换行符，这里修改为：”##”，所有行之间用”##”分隔了

**6） 参数获取**（ARGC ，ARGV）
awk 'BEGIN{FS=":"; print "ARGC="ARGC; for(k in ARGV) {print k"="ARGV[k];}}' /etc/passwd
结果： 
ARGC=2
0=awk
1=/etc/passwd
注： ARGC得到所有输入参数个数，ARGV获得输入参数内容是一个数组

**7） 获得传入的文件名**（FILENAME）
```language
awk 'BEGIN{FS=":";}/^r/ {print FILENAME, "\t", $0}' /etc/passwd
```
结果：
/etc/passwd  root:x:0:0:root:/root:/bin/bash
/etc/passwd  rtkit:x:110:117:RealtimeKit,,,:/proc:/bin/false
注： FILENAME, 0-0−N,NF 不能使用在BEGIN中，BEGIN中不能获得任何与文件记录操作的变量

**8） 获得linux环境变量**（ENVIRON）
awk 'BEGIN{print ENVIRON["PATH"];}' /etc/passwd
结果： `/home/homer/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games`
注：  ENVIRON是子典型数组，可以通过对应键值获得它的值，linux 环境变量还有HOME，`*H**O**M**E*`，PWD等，可以通过linux 命令 env 查看

**9） 输出数据格式设置**（OFMT）
awk 'BEGIN{OFMT="%.3f"; print 1, 2.0, 3.1, 2/3, 123.11111111;}' /etc/passwd
结果： 1   2   3.100   0.667   123.111
注： OFMT默认输出格式是：%.6g 保留六位小数，这里修改OFMT会修改默认数据输出格式，如保留三位小数

**10） 按宽度指定分隔符**（FIELDWIDTHS）
echo 20130108122448 | awk 'BEGIN{FIELDWIDTHS="4 2 2 2 2 3"}{print 1"-"1"−"2"-"3,3,4":"5":"5":"6}'
结果： 2013-01-08 12:24:48
注： FIELDWIDTHS其格式为空格分隔的一串数字，用以对记录进行域的分隔，FIELDWIDTHS="4 2 2 2 2 2"就表示1宽度是4，1宽度是4，2是2，$3是2 .... 这个时候会忽略FS分隔符

**11） RSTART，RLENGTH使用**
awk 'BEGIN{start=match("this is 1 teststr", /[a-z]+$/); print start, RSTART, RLENGTH }'
结果： 11 11 7
awk 'BEGIN{start=match("this is a test",/^[a-z ]+$/); print start, RSTART, RLENGTH }'
结果： 0 0 -1
awk 'BEGIN{start=match("this is a test",/^[a-z ]+$/); print start, RSTART, RLENGTH }'
结果： 1 1 14         # 增加了一个空格“ ”匹配
注： RSTART 被匹配正则表达式首位置，RLENGTH 匹配字符长度，没有找到为-1

**三、外部变量**
**1） 基本用法**
awk 中两个特别的表达式，BEGIN和END
这两者都可用于pattern中，提供BEGIN和END的作用是给程序赋予 初始状态 和 程序结束 之后执行一些扫尾的工作。
a） 任何在BEGIN之后列出的操作（在{}内），将在awk开始扫描输入之前执行
b） 任何在END之后列出的操作，将在扫描完全部的输入之后执行
因此，通常使用BEGIN来显示变量和初始化变量，使用END来输出最终结果。
示例： echo 'awk test' | awk 'BEGIN{print "start...."} {print $0} END{print "end...."}'
结果： 
start....
awk test
end....
**2） 获取外部变量**
格式如： awk ‘{action}’ 变量名=变量值 ，这样传入变量可以在action中获得值。
示例： 
test='awk test'
echo | awk  '{print test}' test="$test"
结果： awk test
echo | awk  test="$test" '{print test}'
结果： awk: cmd. line:1: fatal: cannot open file '{print test}' for reading (No such file or directory)
注：变量名与值放到’{action}’后面，即 test="$test" 在 print 后面

**3） BEGIN程序块中变量**
格式如：awk –v 变量名=变量值 [–v 变量2=值2 …] 'BEGIN{action}’ 
示例：
test='awk test'
echo | awk -v test="$test" 'BEGIN{print test}'
结果： awk test
echo | awk -v test="$test" '{print test}'
结果： awk test
注：用-v 传入变量，可以在3中类型的action 中都可以获得到，但顺序在 action前面

**4） 外部环境变量**
awk  'BEGIN{for (i in ENVIRON) {print i"="ENVIRON[i];}}'
结果：
HLVL=1
PWD=/home/homer
JAVA_HOME=/home/homer/eclipse/jdk1.7.0_05
SHELL=/bin/bash
PATH=/home/homer/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games
..........
注：  ENVIRON是子典型数组，可以通过对应键值获得它的值，linux 环境变量还有HOME，*H**O**M**E*，PWD等，可以通过linux 命令 env 查看
