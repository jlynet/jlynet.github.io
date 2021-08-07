---
title: hexo命令说明 #⽂章⻚⾯上的显示名称，⼀般是中⽂
date: 2021-07-28 12:27:05 #⽂章⽣成时间，⼀般不改，当然也可以任意修改
categories: [默认分类,技术笔记] #分类
tags: [技术笔记,hexo,随笔] #⽂章标签，可空，多标签请⽤格式，注意:后⾯有个空格
description: hexo 搭建博客命令收集备忘
---

安装：
```bash
sudo npm install -g hexo hexo-cli
```

创建并初始化
```bash
mkdir -p ~/myappWeb && cd ~/myappWeb
hexo init # 初始化
npm install # 安装组件
npm install hexo-deployer-git --save #git 部署插件
```

配置SSH key
```bash
$ cd ~/. ssh #检查本机已存在的ssh密钥
ssh-keygen -t rsa -C "GitHub 邮箱"
```

进入部署目录设置git递交信息
```bash
$ cd .deploy_git
$ git config user.name "liuxianan"// 你的github⽤户名，⾮昵称
$ git config user.email " xxx@qq.com "// "// 填写你的github注册邮箱
```

测试是否成功
```bash
$ ssh -T git@github.com # # 注意邮箱地址不⽤改
```

常见命令：
```bash
$ hexo new "postName" #新建⽂章
$ hexo new page "pageName" #新建⻚⾯
$ hexo generate #⽣⽣成成静静态态⻚⾯⻚⾯⾄⾄public public⽬⽬录录
$ hexo server #开启预览访问端⼝（默认端⼝4000，，'ctrl + c'关闭server）
$ hexo deploy #部署到GitHub
$ hexo help # 查看帮助
$ hexo version #查看Hexo的版本
$ hexo clean #清楚
```

缩写：
```bash
$ hexo n == hexo new
$ hexo g == hexo generate
$ hexo s == hexo server
$ hexo d == hexo deploy
```

组合命令：
```bash
hexo s -g #⽣成并本地预览
hexo d -g #⽣成并上传
```

新建⽂章：
```bash
hexo new "JsonFormatTool" 
hexo new "swagger2word"
hexo new "Lockbox"
hexo new "Arthas安装使用"
hexo new "awk命令使用介绍"

#Java 诊断工具 Arthas 入门教程
#文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=qDlgqpBT
hexo new "Arthas 基础教程"
hexo new "Arthas 进阶"

#Java 诊断工具 Arthas 最佳实践
#文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=PaiFAkJM
hexo new "Arthas后台异步任务案例"
hexo new "学习Arthasarthas-boot支持的参数案例"
hexo new "学习Arthasclassloader案例"
hexo new "Arthas获取Spring上下文案例"
hexo new "Arthas排查HTTP请求返回401案例"
hexo new "Arthas排查HTTP请求返回404案例"
hexo new "ArthasHttpAPI案例"
hexo new "Arthas热更新代码案例"
hexo new "Arthas排查logger冲突问题案例"
hexo new "Arthas执行结果存日志案例"
hexo new "Arthas查找TopN线程案例"
hexo new "Arthas排查函数调用异常案例"
hexo new "ArthasWebConsole案例"
hexo new "Arthas动态更新应用LoggerLevel案例"


#Java 诊断工具 Arthas 高级命令教程
#文章拷贝来源：https://start.aliyun.com/course?spm=a2ck6.17690074.0.0.28bc2e7dHTphXs&id=W52ZYGKJ
hexo new "Arthasvmoption命令"
hexo new "Arthasthread命令"
hexo new "Arthassysenv命令"
hexo new "Arthassysprop命令"
hexo new "Arthasognl命令"
hexo new "Arthasperfcounter命令"
hexo new "Arthaslogger命令"
hexo new "Arthasmbean命令"
hexo new "Arthasjvm命令"
hexo new "Arthasheapdump命令"
hexo new "Arthasdashboard命令"
hexo new "Arthasgetstatic命令"
hexo new "Arthastt命令"
hexo new "Arthaswatch命令"
hexo new "Arthastrace命令"
hexo new "Arthasstack命令"
hexo new "Arthasprofiler命令"
hexo new "Arthasmonitor命令"
hexo new "Arthasmc-retransform命令"
hexo new "Arthassm命令"
hexo new "Arthassc命令"
hexo new "Arthasmc-redefine命令"
hexo new "Arthasjad命令"
hexo new "Arthasdump命令"
hexo new "Arthasclassloader命令"


```

新建⻚⾯:
```bash
hexo new page "个人作品展示"
```

文字里面添加图片
> 在`_config.yml`配置文件中，修改为 `post_asset_folder: true` 网站切割域名路径前缀位置 `post_asset_folder_position_length: 4`
```bash
npm install https://github.com/ai930/hexo-asset-image --save
```
> 此时再执行命令 `hexo n article_name` 创建新的文章，在 `source/_posts` 中会生成文章 `post_name.md` 和同名文件夹 post_name,我们将文章中所使用到的将图片资源均放在 post_name 中，这时就可以在文章中使用相对路径引用图片资源了
`![img_name](img_name.jpg) #文章中的图片资源路径格式`

