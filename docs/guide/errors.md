---
sidebar_position: 4
---

# 错误处理

GraphQL 的错误处理机制通过标准化的[错误对象(Errors)](https://spec.graphql.org/October2021/#sec-Errors)结构, 确保了客户端可以一致且可靠地解析和处理来自服务器的错误信息

## **错误对象定义**

在 GraphQL 中, 所有的错误信息都会被包含在一个名为 errors 的字段中, 该字段是 GraphQL 响应的一部分

### Errors

| 字段         | 类型                      | 说明                                                                     |
| ------------ | ------------------------- | ------------------------------------------------------------------------ |
| `message`    | String                    | 错误的描述信息, 是所有错误对象必须包含的字段                             |
| `locations`  | [[Location](#location)]   | 一个包含错误位置的数组, 每个 `Location` 对象包括 `line` 和 `column` 字段 |
| `path`       | [String \| Int]           | 一个数组, 表示错误发生的路径, 标识嵌套字段中的错误位置                   |
| `extensions` | [Extensions](#extensions) | 可选字段, 可以包含自定义的扩展信息, 如错误代码或其他调试信息             |

### Location

| 字段     | 类型 | 说明           |
| -------- | ---- | -------------- |
| `line`   | Int  | 错误发生的行号 |
| `column` | Int  | 错误发生的列号 |

### Extensions

| 字段名称         | 类型   | 说明                                             |
| ---------------- | ------ | ------------------------------------------------ |
| `code`           | String | 错误代码, 用于标识错误类型                       |
| `additionalInfo` | String | 其他额外信息, 提供关于错误的更多上下文           |
| `timestamp`      | String | 错误发生的时间戳, 记录错误的具体发生时间         |
| `details`        | Object | 包含具体错误的详细信息, 可以是任何自定义的键值对 |

例:

```json
{
  "data": null,
  "errors": [
    {
      "message": "Error message",
      "locations": [
        {
          "line": 2,
          "column": 4
        }
      ],
      "path": ["fieldName"],
      "extensions": {
        "code": "SOME_ERROR_CODE",
        "additionalInfo": "Some additional information"
      }
    }
  ]
}
```

## GraphQL Errors 注册

代码执行中抛出的异常(Exception)可以注册为 [GraphQL Errors](#错误对象定义) 返回

1. 实现 `io.graphoenix.spi.error.ErrorInfoLoader` 接口
2. 实现 `load()` 方法, 在方法中使用 `io.graphoenix.spi.error.ErrorInfo.put()` 静态方法注册异常对应的错误代码和错误信息
3. 在 SPI 中注册 `io.graphoenix.spi.error.ErrorInfoLoader` 接口

```java
package io.graphence.core.error;

import com.google.auto.service.AutoService;
import io.graphoenix.spi.error.ErrorInfo;
import io.graphoenix.spi.error.ErrorInfoLoader;
import io.jsonwebtoken.JwtException;

// highlight-start
// 使用 Google AutoService 注册 SPI
@AutoService(ErrorInfoLoader.class)
// highlight-end
public class GraphenceErrorInfoLoader implements ErrorInfoLoader {

    // highlight-start
    @Override
    public void load() {
        ErrorInfo.put(JwtException.class, -40101, "authentication failed");
        // ...
    }
    // highlight-end
}
```

手动注册 SPI

```txt title="META-INF/services/io.graphoenix.spi.error.ErrorInfoLoader"
io.graphence.core.error.GraphenceErrorInfoLoader
```

异常时返回:

```json
{
  "errors": [
    {
      "message": "authentication failed",
      "extensions": {
        "code": -40101
      }
    }
  ]
}
```

## HTTP 异常状态码注册

代码执行中抛出的异常(Exception)可以注册为注册为 [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 返回

1. 实现 `io.graphoenix.http.server.error.HttpErrorStatusLoader` 接口
2. 实现 `load()` 方法, 在方法中使用 `iio.graphoenix.http.server.error.HttpErrorStatus.put()` 静态方法注册异常对应的错误状态码
3. 在 SPI 中注册 `io.graphoenix.http.server.error.HttpErrorStatusLoader` 接口

例:

```java
package io.graphence.core.error;

import com.google.auto.service.AutoService;
import io.graphoenix.http.server.error.HttpErrorStatus;
import io.graphoenix.http.server.error.HttpErrorStatusLoader;
import io.jsonwebtoken.JwtException;

// highlight-start
// 使用 Google AutoService 注册 SPI
@AutoService(HttpErrorStatusLoader.class)
// highlight-end
public class GraphenceHttpErrorStatusLoader implements HttpErrorStatusLoader {

    @Override
    public void load() {
        HttpErrorStatus.put(JwtException.class, 401);
        // ...
    }
}
```

手动注册 SPI

```txt title="META-INF/services/io.graphoenix.http.server.error.HttpErrorStatusLoader"
io.graphence.core.error.GraphenceHttpErrorStatusLoader
```

异常时返回:

```http
401 Unauthorized
```
