var posts=["2021/07/30/Arthas安装使用/","2021/10/09/Docker-私有仓库搭建/","2022/06/30/GitHub博客hexo建站之设置SSH密钥/","2021/07/28/JsonFormatTool/","2021/10/18/Linux网络基础，路由的追踪/","2021/07/28/Lockbox/","2021/10/17/OpenResty-执行流程阶段/","2021/08/16/PHP和Java中的SHA256/","2021/10/09/Portainer安装配置/","2021/07/31/awk命令使用介绍/","2021/11/17/hello-world/","2021/07/28/hexo命令说明/","2021/10/17/ngx-lua-模块详细讲解（基于openresty）/","2021/10/23/ssh端口转发笔记/","2021/07/28/swagger2word/","2021/09/29/各种开源协议介绍/","2021/10/21/解决SpringBoot-2-3-MultipartFile为空的问题/","2021/08/07/Java诊断工具Arthas入门教程/Arthas-基础教程/","2021/10/01/etCache-缓存框架的使用以及源码分析/","2021/08/07/Java诊断工具Arthas入门教程/Arthas-进阶/","2021/10/10/从Clover到OpenCore/","2021/08/07/Java诊断工具Arthas最佳实践/ArthasHttpAPI案例/","2021/08/07/Java诊断工具Arthas最佳实践/ArthasWebConsole案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas动态更新应用LoggerLevel案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas后台异步任务案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas执行结果存日志案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas排查HTTP请求返回401案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas排查HTTP请求返回404案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas排查logger冲突问题案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas排查函数调用异常案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas查找TopN线程案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas热更新代码案例/","2021/08/07/Java诊断工具Arthas最佳实践/Arthas获取Spring上下文案例/","2021/08/07/Java诊断工具Arthas最佳实践/学习Arthasarthas-boot支持的参数案例/","2021/08/07/Java诊断工具Arthas最佳实践/学习Arthasclassloader案例/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasclassloader命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasdashboard命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasdump命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasgetstatic命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasheapdump命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasjad命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthaslogger命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasjvm命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasmbean命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasmc-redefine命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasmc-retransform命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasmonitor命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasognl命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasperfcounter命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasprofiler命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthassm命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthassc命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasstack命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthassysenv命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthassysprop命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasthread命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthastrace命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthastt命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthasvmoption命令/","2021/08/07/Java诊断工具Arthas高级命令教程/Arthaswatch命令/","2022/08/04/HAProxy-原理-dash-board-各指标含义/","2024/06/05/Unicode-character-issue-0-to-255/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };