---
title: PHP和Java中的SHA256
date: 2021-08-16 22:44:29
categories: [其他]
tags: [技术笔记,java,php]
---

我正在将一些[Java](https://codeday.me/tag/Java)代码移植到[PHP](https://codeday.me/tag/PHP)代码中.在Java中,我有一个哈希SHA256代码,如下所示：
```
public static String hashSHA256(String input)
        throws NoSuchAlgorithmException {
    MessageDigest mDigest = MessageDigest.getInstance("SHA-256");
byte[] shaByteArr = mDigest.digest(input.getBytes(Charset.forName("UTF-8")));
    StringBuilder hexStrBuilder = new StringBuilder();
    for (int i = 0; i < shaByteArr.length; i++) {
        hexStrBuilder.append(Integer.toHexString(0xFF & shaByteArr[i]));
    }

    return hexStrBuilder.toString();
}
```

在PHP中,我哈希如下：
```
$hash = hash("sha256", utf8_encode($input));
```

我用input =“test”运行示例代码.但是,我得到了2个不同的哈希字符串：
```
Java: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2bb822cd15d6c15b0f0a8
PHP: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
```

有人可以向我解释为什么以及如何让它们相互匹配？请注意,我无法修改Java实现代码,只能修改PHP.

万分感激！

解决方法:
PHP版本是正确的;测试的SHA-256校验和是9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08.
Java版本返回相同的校验和,其中两个0被剥离.这是因为您将字节转换为十六进制的方式.而不是使用0xFF& ing使用它们,使用String.format(),如[this answer](https://stackoverflow.com/a/2817883/2765666)：
```
hexStrBuilder.append(String.format("%02x", shaByteArr[i]));
```

修改方法：
```
public static String hashSHA256(String input)
        throws NoSuchAlgorithmException {
    MessageDigest mDigest = MessageDigest.getInstance("SHA-256");

byte[] shaByteArr = mDigest.digest(input.getBytes(Charset.forName("UTF-8")));
    StringBuilder hexStrBuilder = new StringBuilder();
    for (int i = 0; i < shaByteArr.length; i++) {
        //hexStrBuilder.append(Integer.toHexString(0xFF & shaByteArr[i]));
        hexStrBuilder.append(String.format("%02x", shaByteArr[i]));
    }

    return hexStrBuilder.toString();
}

我意识到你说你不能修改Java代码,但它是不正确的！

来源： https://codeday.me/bug/20190725/1530972.html
