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

# 文字里面添加图片
> 在`_config.yml`配置文件中，修改为 `post_asset_folder: true` 网站切割域名路径前缀位置 `post_asset_folder_position_length: 4`
```bash
npm install https://github.com/ai930/hexo-asset-image --save
```
> 此时再执行命令 `hexo n article_name` 创建新的文章，在 `source/_posts` 中会生成文章 `post_name.md` 和同名文件夹 post_name,我们将文章中所使用到的将图片资源均放在 post_name 中，这时就可以在文章中使用相对路径引用图片资源了
`![img_name](img_name.jpg) #文章中的图片资源路径格式`


# 给文章添加目录
安装
```bash
npm install hexo-toc --save
```
使用方法跟显示文章摘要类似，在Markdown中需要显示文章目录的地方添加 `<!-- toc -->`
在博客根目录下的 `_config.yml` 中如下配置：
```yaml
toc:
  maxDepth: 3
```
`maxDepth` 表示目录深度为3，即最多生成三级目录。
找到主题下的文章模版，我的是`themes\yilia\layout\_partial\article.ejs`。
在其末尾增加代码：
```html
<% if (!index && theme.toc){ %>
<script>
  var tocEx = function(el){
    var toc = document.querySelector(el), content = toc.innerHTML;
    content = content.replace('<!-- toc -->', '<div class="toc">').replace('<!-- tocstop -->', '</div>');
    toc.innerHTML = content;
  }('.article-entry');
</script>
<% } %>
<style>
.toc {
  float: right;
  margin-left: 40px;
  padding: 10px 20px;
  background: #f1f1f1;
  border-radius: 10px;
  box-shadow: 0 0 3px #bbb;
}
</style>
```
