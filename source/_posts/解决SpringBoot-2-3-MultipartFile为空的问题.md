---
title: 解决SpringBoot 2.3 MultipartFile为空的问题
date: 2021-10-21 17:22:22
categories: [默认分类,技术笔记]
tags: [技术笔记,Spring,java,SpringBoot,随笔]
---

原本用的2.0.x的版本上传文件是没有问题的，后来升级SpringBoot版本为2.3.3就无法上传文件了，我看到MultipartFile是为空的。



### 解决办法

不使用`Multipart`自动配置，再排除原有的Multipart配置`@EnableAutoConfiguration(exclude = {MultipartAutoConfiguration.class})`，然后显示声明`CommonsMultipartResolver`为`mutipartResolver`。

1. 排除`MultipartAutoConfiguration`

   ```java
   @SpringBootApplication(exclude = {MultipartAutoConfiguration.class})
   ```

2. 添加依赖

   ```xml
   <dependency>
       <groupId>commons-io</groupId>
       <artifactId>commons-io</artifactId>
       <version>2.6</version>
   </dependency>
   <dependency>
       <groupId>commons-fileupload</groupId>
       <artifactId>commons-fileupload</artifactId>
       <version>1.4</version>
   </dependency>
   ```

3. 显示声明`CommonsMultipartResolver`为`mutipartResolver`：

```java
@Configuration
public class UploadResolverConfig {

    /**
     * 显示声明CommonsMultipartResolver为mutipartResolver
     *
     * @return
     */
    @Bean(name = "multipartResolver")
    public MultipartResolver multipartResolver() {
        CommonsMultipartResolver resolver = new CommonsMultipartResolver();
        resolver.setDefaultEncoding("UTF-8");
        // resolveLazily属性启用是为了推迟文件解析，以在在UploadAction中捕获文件大小异常
        resolver.setResolveLazily(true);
        // 设置了文件放入临时文件夹的大小限制
        resolver.setMaxInMemorySize(40960);
        // 设置单个上传数据总大小25M
        resolver.setMaxUploadSizePerFile(25 * 1024 * 1024);
        // 设置总上传数据总大小50M
        resolver.setMaxUploadSize(5 * 1024 * 1024);
        return resolver;
    }

}
```



## MultipartAutoConfiguration源码

```java
/**
 * {@link EnableAutoConfiguration Auto-configuration} for multi-part uploads. Adds a
 * {@link StandardServletMultipartResolver} if none is present, and adds a
 * {@link javax.servlet.MultipartConfigElement multipartConfigElement} if none is
 * otherwise defined. The {@link ServletWebServerApplicationContext} will associate the
 * {@link MultipartConfigElement} bean to any {@link Servlet} beans.
 * <p>
 * The {@link javax.servlet.MultipartConfigElement} is a Servlet API that's used to
 * configure how the server handles file uploads.
 *
 * @author Greg Turnquist
 * @author Josh Long
 * @author Toshiaki Maki
 * @since 2.0.0
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass({ Servlet.class, StandardServletMultipartResolver.class, MultipartConfigElement.class })
@ConditionalOnProperty(prefix = "spring.servlet.multipart", name = "enabled", matchIfMissing = true)
@ConditionalOnWebApplication(type = Type.SERVLET)
@EnableConfigurationProperties(MultipartProperties.class)
public class MultipartAutoConfiguration {

    private final MultipartProperties multipartProperties;

    public MultipartAutoConfiguration(MultipartProperties multipartProperties) {
        this.multipartProperties = multipartProperties;
    }

    @Bean
    @ConditionalOnMissingBean({ MultipartConfigElement.class, CommonsMultipartResolver.class })
    public MultipartConfigElement multipartConfigElement() {
        return this.multipartProperties.createMultipartConfig();
    }

    @Bean(name = DispatcherServlet.MULTIPART_RESOLVER_BEAN_NAME)
    @ConditionalOnMissingBean(MultipartResolver.class)
    public StandardServletMultipartResolver multipartResolver() {
        StandardServletMultipartResolver multipartResolver = new StandardServletMultipartResolver();
        multipartResolver.setResolveLazily(this.multipartProperties.isResolveLazily());
        return multipartResolver;
    }

}
```



## CommonsMultipartResolver源码

```java
/**
 * Servlet-based {@link MultipartResolver} implementation for
 * <a href="https://commons.apache.org/proper/commons-fileupload">Apache Commons FileUpload</a>
 * 1.2 or above.
 *
 * <p>Provides "maxUploadSize", "maxInMemorySize" and "defaultEncoding" settings as
 * bean properties (inherited from {@link CommonsFileUploadSupport}). See corresponding
 * ServletFileUpload / DiskFileItemFactory properties ("sizeMax", "sizeThreshold",
 * "headerEncoding") for details in terms of defaults and accepted values.
 *
 * <p>Saves temporary files to the servlet container's temporary directory.
 * Needs to be initialized <i>either</i> by an application context <i>or</i>
 * via the constructor that takes a ServletContext (for standalone usage).
 *
 * @author Trevor D. Cook
 * @author Juergen Hoeller
 * @since 29.09.2003
 * @see #CommonsMultipartResolver(ServletContext)
 * @see #setResolveLazily
 * @see org.apache.commons.fileupload.servlet.ServletFileUpload
 * @see org.apache.commons.fileupload.disk.DiskFileItemFactory
 */
public class CommonsMultipartResolver extends CommonsFileUploadSupport
        implements MultipartResolver, ServletContextAware {

    private boolean resolveLazily = false;


    /**
     * Constructor for use as bean. Determines the servlet container's
     * temporary directory via the ServletContext passed in as through the
     * ServletContextAware interface (typically by a WebApplicationContext).
     * @see #setServletContext
     * @see org.springframework.web.context.ServletContextAware
     * @see org.springframework.web.context.WebApplicationContext
     */
    public CommonsMultipartResolver() {
        super();
    }

    /**
     * Constructor for standalone usage. Determines the servlet container's
     * temporary directory via the given ServletContext.
     * @param servletContext the ServletContext to use
     */
    public CommonsMultipartResolver(ServletContext servletContext) {
        this();
        setServletContext(servletContext);
    }


    /**
     * Set whether to resolve the multipart request lazily at the time of
     * file or parameter access.
     * <p>Default is "false", resolving the multipart elements immediately, throwing
     * corresponding exceptions at the time of the {@link #resolveMultipart} call.
     * Switch this to "true" for lazy multipart parsing, throwing parse exceptions
     * once the application attempts to obtain multipart files or parameters.
     */
    public void setResolveLazily(boolean resolveLazily) {
        this.resolveLazily = resolveLazily;
    }

    /**
     * Initialize the underlying {@code org.apache.commons.fileupload.servlet.ServletFileUpload}
     * instance. Can be overridden to use a custom subclass, e.g. for testing purposes.
     * @param fileItemFactory the Commons FileItemFactory to use
     * @return the new ServletFileUpload instance
     */
    @Override
    protected FileUpload newFileUpload(FileItemFactory fileItemFactory) {
        return new ServletFileUpload(fileItemFactory);
    }

    @Override
    public void setServletContext(ServletContext servletContext) {
        if (!isUploadTempDirSpecified()) {
            getFileItemFactory().setRepository(WebUtils.getTempDir(servletContext));
        }
    }


    @Override
    public boolean isMultipart(HttpServletRequest request) {
        return ServletFileUpload.isMultipartContent(request);
    }

    @Override
    public MultipartHttpServletRequest resolveMultipart(final HttpServletRequest request) throws MultipartException {
        Assert.notNull(request, "Request must not be null");
        if (this.resolveLazily) {
            return new DefaultMultipartHttpServletRequest(request) {
                @Override
                protected void initializeMultipart() {
                    MultipartParsingResult parsingResult = parseRequest(request);
                    setMultipartFiles(parsingResult.getMultipartFiles());
                    setMultipartParameters(parsingResult.getMultipartParameters());
                    setMultipartParameterContentTypes(parsingResult.getMultipartParameterContentTypes());
                }
            };
        }
        else {
            MultipartParsingResult parsingResult = parseRequest(request);
            return new DefaultMultipartHttpServletRequest(request, parsingResult.getMultipartFiles(),
                    parsingResult.getMultipartParameters(), parsingResult.getMultipartParameterContentTypes());
        }
    }

    /**
     * Parse the given servlet request, resolving its multipart elements.
     * @param request the request to parse
     * @return the parsing result
     * @throws MultipartException if multipart resolution failed.
     */
    protected MultipartParsingResult parseRequest(HttpServletRequest request) throws MultipartException {
        String encoding = determineEncoding(request);
        FileUpload fileUpload = prepareFileUpload(encoding);
        try {
            List<FileItem> fileItems = ((ServletFileUpload) fileUpload).parseRequest(request);
            return parseFileItems(fileItems, encoding);
        }
        catch (FileUploadBase.SizeLimitExceededException ex) {
            throw new MaxUploadSizeExceededException(fileUpload.getSizeMax(), ex);
        }
        catch (FileUploadBase.FileSizeLimitExceededException ex) {
            throw new MaxUploadSizeExceededException(fileUpload.getFileSizeMax(), ex);
        }
        catch (FileUploadException ex) {
            throw new MultipartException("Failed to parse multipart servlet request", ex);
        }
    }

    /**
     * Determine the encoding for the given request.
     * Can be overridden in subclasses.
     * <p>The default implementation checks the request encoding,
     * falling back to the default encoding specified for this resolver.
     * @param request current HTTP request
     * @return the encoding for the request (never {@code null})
     * @see javax.servlet.ServletRequest#getCharacterEncoding
     * @see #setDefaultEncoding
     */
    protected String determineEncoding(HttpServletRequest request) {
        String encoding = request.getCharacterEncoding();
        if (encoding == null) {
            encoding = getDefaultEncoding();
        }
        return encoding;
    }

    @Override
    public void cleanupMultipart(MultipartHttpServletRequest request) {
        if (!(request instanceof AbstractMultipartHttpServletRequest) ||
                ((AbstractMultipartHttpServletRequest) request).isResolved()) {
            try {
                cleanupFileItems(request.getMultiFileMap());
            }
            catch (Throwable ex) {
                logger.warn("Failed to perform multipart cleanup for servlet request", ex);
            }
        }
    }

}
```

控制器使用

````
@PostMapping("/upload")
	public void bigStopFile(@RequestParam Map<String, MultipartFile> map,HttpServletRequest request, HttpServletResponse response) throws IOException {
	......
	}
````



注意 `MultipartResolver` 与 `MultipartConfigElement` 冲突，如果同时配置也会造成`MultipartFile`为空的情况，`MultipartConfigElement`配置方式如下：

```
@Bean
	public MultipartConfigElement multipartConfigElement() {
	    MultipartConfigFactory factory = new MultipartConfigFactory();
	    //factory.setLocation("/app/sinova/tmp");
	    //文件最大
	    factory.setMaxFileSize(DataSize.of(50, DataUnit.MEGABYTES));
	    /// 设置总上传数据总大小
	    factory.setMaxRequestSize(DataSize.of(200, DataUnit.MEGABYTES));
	    return factory.createMultipartConfig();
	}
```



