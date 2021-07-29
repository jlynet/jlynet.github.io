# www.jlynet.cn

#### 介绍
个人博客源码

#### 软件架构
软件架构说明


#### 安装教程

1.  xxxx
2.  xxxx
3.  xxxx

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)


https://ai930.github.io/jlynet.github.io


cd themes/yilia-plus;
npm install

npm run dev
npm run dist
npm run build

ERROR in Node Sass does not yet support your current environment: OS X 64-bit with Unsupported runtime (83)
不用回退node版本，而是升级node-sass。
update你的sass版本即可：
npm rebuild node-sass
或者自己手动升级：
1.先卸载
npm uninstall --save node-sass
2.清除缓存
npm cache clean -f
3.升级node-sass模块
npm install --save node-sass


要创建 A 记录，请将 apex 域指向 GitHub Pages 的 IP 地址。
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
警告：我们强烈建议不要使用通配符 DNS 记录，例如 `*.example.com`。 通配符 DNS 记录将允许任何人在您的其中一个子域上托管 GitHub Pages 站点。

要确认您的 DNS 记录配置正确，请使用 dig 命令，将 EXAM.COM 替换为您的 apex 域。 确认结果与上面 GitHub Pages 的 IP 地址相匹配。
$ dig EXAMPLE.COM +noall +answer
> EXAMPLE.COM     3600    IN A     185.199.108.153
> EXAMPLE.COM     3600    IN A     185.199.109.153
> EXAMPLE.COM     3600    IN A     185.199.110.153
> EXAMPLE.COM     3600    IN A     185.199.111.153

要确认您的 DNS 记录配置正确，请使用 dig 命令，将 WWW.EXAM.COM 替换为您的 www 子域变体。
$ dig WWW.EXAMPLE.COM +nostats +nocomments +nocmd
> ;WWW.EXAMPLE.COM.                     IN      A
> WWW.EXAMPLE.COM.              3592    IN      CNAME   YOUR-USERNAME.github.io.
> YOUR-USERNAME.github.io.      43192   IN      CNAME    GITHUB-PAGES-SERVER .
>  GITHUB-PAGES-SERVER .         22      IN      A       192.0.2.1

安装使用dig命令
```bash
brew install bind
apt-get install dnsutils
yum install bind-utils
```
简明使用，只会输出A记录(写脚本的时候容易获取ip地址)
```bash
dig cmsky.com +short
```
只输出mx记录，简明使用
```bash
dig mx jpuyy.com +short
```
只输出NS记录
```bash
dig ns cmsky.com
```
查询SOA( Start of Autority ) 返回主DNS服务器
```bash
dig soa cmsky.com
```
指定dns，例如查询8.8.8.8中的jpuyy.com记录
```bash
dig +short @8.8.8.8 cmsky.com
```
大部分的时候dig最下面显示了查询所用的时间及DNS服务器，时间，数据大小。DNS超时时间为30秒，查询时间对于排查DNS问题很有用。
```
;; Query time: 48 msec
;; SERVER: 10.202.72.118#53(10.202.72.118)
;; WHEN: Sun Oct 12 21:41:47 2014
;; MSG SIZE  rcvd: 225
```
DNS的解析是递规解析，那么用dig可以加+trace参数，会显示完整的，无缓存，递规的查询，显示的是完整的trace记录。
```bash
dig jpuyy.com +trace
```
服务器上很多时候是双线或三线，如果有智能解析的话要测试从某一个 ip 去请求 dns，加 -b 参数
```bash
dig -b cmsky.com
```

