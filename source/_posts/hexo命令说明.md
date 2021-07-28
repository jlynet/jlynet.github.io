---
title: hexo命令说明 #⽂章⻚⾯上的显示名称，⼀般是中⽂
date: 2021-07-28 12:27:05 #⽂章⽣成时间，⼀般不改，当然也可以任意修改
categories: 默认分类 #分类
tags: [hexo,github] #⽂章标签，可空，多标签请⽤格式，注意:后⾯有个空格
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
hexo new "postName" # hexo new "postName" #新新建建⽂⽂章章
hexo new page "pageName" # hexo new page "pageName" #新新建建⻚⾯⻚⾯
hexo generate # hexo generate #⽣⽣成成静静态态⻚⾯⻚⾯⾄⾄public public⽬⽬录录
hexo server # hexo server #开开启启预预览访览访问问端端⼝⼝（（默默认认端端⼝⼝4000 4000，，'ctrl + c' 'ctrl + c'关关闭闭server server））
hexo deploy # hexo deploy #部部署署到到GitHub GitHub
hexo help # hexo help # 查查看看帮帮助助
hexo version # hexo version #查查看看Hexo Hexo的的版版本本
```

缩写：
```bash
hexo n == hexo new
hexo g == hexo generate
hexo s == hexo server
hexo d == hexo deploy
```

组合命令：
```bash
hexo s -g # hexo s -g #⽣⽣成成并并本本地地预预览览
hexo d -g # hexo d -g #⽣⽣成成并并上上传
```
