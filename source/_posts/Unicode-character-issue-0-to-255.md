---
title: Unicode character issue 0 to 255
date: 2024-06-05 11:16:29
categories: [中间件,技术笔记] #分类
tags: [技术笔记,Tomcat,中间件] #⽂章标签，可空，多标签请⽤格式，注意:后⾯有个空格
description: Tomcat 302 重定向带中文参数后出现白屏问题
---

# 代码实现

```java
response.sendRedirect("test.html?name=我是中文aaaa");
```

# 运行容器

> Tomcat 8.5.100

# 出现的错误

```text
Caused by: java.lang.IllegalArgumentException: The Unicode character [Б] at code point [1,041] cannot be encoded as it is outside the permitted range of 0 to 255.
        at org.apache.coyote.http2.HPackHuffman.encode(HPackHuffman.java:452)
        at org.apache.coyote.http2.HpackEncoder.writeHuffmanEncodableValue(HpackEncoder.java:229)
        at org.apache.coyote.http2.HpackEncoder.encode(HpackEncoder.java:191)
        at org.apache.coyote.http2.Http2UpgradeHandler.doWriteHeaders(Http2UpgradeHandler.java:727)
        at org.apache.coyote.http2.Http2UpgradeHandler.writeHeaders(Http2UpgradeHandler.java:680)
        at org.apache.coyote.http2.Stream.writeHeaders(Stream.java:466)
        at org.apache.coyote.http2.StreamProcessor.prepareResponse(StreamProcessor.java:151)
        at org.apache.coyote.AbstractProcessor.action(AbstractProcessor.java:379)
        at org.apache.coyote.Response.action(Response.java:211)
        at org.apache.coyote.Response.sendHeaders(Response.java:440)
        at org.apache.coyote.http2.Http2OutputBuffer.doWrite(Http2OutputBuffer.java:57)
        at org.apache.coyote.Response.doWrite(Response.java:615)
        at org.apache.catalina.connector.OutputBuffer.realWriteBytes(OutputBuffer.java:340)
        at org.apache.catalina.connector.OutputBuffer.flushByteBuffer(OutputBuffer.java:784)
        at org.apache.catalina.connector.OutputBuffer.append(OutputBuffer.java:689)
        at org.apache.catalina.connector.OutputBuffer.writeBytes(OutputBuffer.java:388)
        at org.apache.catalina.connector.OutputBuffer.write(OutputBuffer.java:366)
        at org.apache.catalina.connector.CoyoteOutputStream.write(CoyoteOutputStream.java:96)
```

# 解决

> 参考 `https://gitee.com/jlynet-openSrc/jlynet-Tomcat.git`
