---
sidebar_position: 4
---

# 异常

GraphQL 协议中对于异常(Errors)的定义非常明确, 以确保客户端能够正确理解和处理服务器返回的错误信息

## **异常定义**

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

## **异常注册**

在代码中抛出的异常(Exception)使用 `ErrorInfoLoader` 注册为 GraphQL Error 返回

例:
```java
import com.google.auto.service.AutoService;
import io.graphoenix.spi.error.ErrorInfo;
import io.graphoenix.spi.error.ErrorInfoLoader;
import io.jsonwebtoken.JwtException;

@AutoService(ErrorInfo.class)
public class GraphenceErrorInfoLoader implements ErrorInfoLoader {

    @Override
    public void load() {
        ErrorInfo.put(JwtException.class, -40101, "authentication failed");
    }
}
```

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

## **Http状态码注册**

在代码中抛出的异常(Exception)使用 `HttpErrorStatusLoader` 注册为 Http Response Status 返回

例:
```java
import com.google.auto.service.AutoService;
import io.graphoenix.http.server.error.HttpErrorStatus;
import io.graphoenix.http.server.error.HttpErrorStatusLoader;
import io.jsonwebtoken.JwtException;

@AutoService(HttpErrorStatusLoader.class)
public class GraphenceHttpErrorStatusLoader implements HttpErrorStatusLoader {

    @Override
    public void load() {
        HttpErrorStatus.put(JwtException.class, 401);
    }
}
```

```http
401 Unauthorized
```