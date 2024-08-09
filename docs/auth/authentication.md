---
sidebar_position: 1
---

# 认证(Authentication)

认证（Authentication）是一个验证用户身份的过程, 用于确认用户是否为其声称的主体, 用以确保后续操作的安全性和合法性.

Graphoenix 结合 GraphQL 特性, 基于 [JWT](https://github.com/jakartaee/inject) 和 [Casbin](https://casbin.org/) 对认证和授权等安全特性提供支持, 提供轻量级框架: [**Graphence**](https://github.com/doukai/graphence)

## 安装

添加依赖

```gradle
repositories {
    mavenCentral()
    // highlight-start
    jcenter()
    // highlight-end
}

dependencies {
    // highlight-start
    implementation 'org.graphoenix:graphence-core:0.0.1-SNAPSHOT'
    implementation 'org.graphoenix:graphence-security:0.0.1-SNAPSHOT'
    // highlight-end
    implementation 'org.graphoenix:graphoenix-core:0.1.0'
    implementation 'org.graphoenix:graphoenix-http-server:0.1.1'
    implementation 'org.graphoenix:graphoenix-r2dbc:0.1.0'
    implementation 'org.graphoenix:nozdormu-inject:0.1.0'
    implementation 'org.graphoenix:nozdormu-interceptor:0.1.0'
    implementation 'org.graphoenix:nozdormu-config:0.1.0'

    runtimeOnly 'org.mariadb:r2dbc-mariadb:1.1.4'

    // highlight-start
    annotationProcessor 'org.graphoenix:graphence-core:0.0.1-SNAPSHOT'
    annotationProcessor 'org.graphoenix:graphence-security:0.0.1-SNAPSHOT'
    // highlight-end
    annotationProcessor 'org.graphoenix:graphoenix-annotation-processor:0.1.0'
    annotationProcessor 'org.graphoenix:graphoenix-sql:0.1.0'
    annotationProcessor 'org.graphoenix:graphoenix-http-server:0.1.1'
    annotationProcessor 'org.graphoenix:graphoenix-r2dbc:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-inject:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-interceptor:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-config:0.1.0'

}
```

## 初始化管理员(开发环境)

开发环境下, 需要配置系统初始化管理员添加用户, 使用 `security.rootUser` 和 `security.rootPassword` 配置管理员账户和密码

```conf
security {
  rootUser = "root"
  rootPassword = "root"
}
```

## 认证拦截

任何没有 JWT 令牌的请求都会被 Graphence 拦截

```graphql
{
  userList {
    id
    name
  }
}
```

```json
{
  "errors": [
    {
      "message": "-40100: unauthorized",
      "locations": null,
      "path": null,
      "extensions": {
        "timestamp": "2024-08-09T16:27:43.179284",
        "code": -40100
      }
    }
  ]
}
```

## 登陆

使用变更 `login` 方法登陆, 传入账户(login)和密码(password)

```graphql
mutation {
  login(login: "root", password: "root")
}
```

认证成功后将返回 JWT 令牌

```json
{
  "data": {
    "login": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vZ3JhcGhvZW5peC5pbyIsInN1YiI6IjEiLCJmdWxsX25hbWUiOiJyb290IiwiZ3JvdXBzIjpbXSwicm9sZXMiOlsiMSJdLCJwZXJtaXNzaW9uX3R5cGVzIjpbXSwiaXNfcm9vdCI6dHJ1ZSwiaWF0IjoxNzIzMTkyOTEwLCJleHAiOjE3MjMxOTY1MTB9.6GVW3owkqGoxw3F3SwAmQwEtzV__8ly4PAv03uAri90"
  }
}
```

## JWT 令牌

在请求 Headers 中加入 JWT 令牌: ``Authorization: Bearer YOUR-JWT-TOKEN``

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vZ3JhcGhvZW5peC5pbyIsInN1YiI6IjEiLCJmdWxsX25hbWUiOiJyb290IiwiZmFtaWx5X25hbWUiOiIyIiwiZ3JvdXBzIjpbXSwicm9sZXMiOlsiMSIsIjIiXSwicGVybWlzc2lvbl90eXBlcyI6W10sImlzX3Jvb3QiOnRydWUsImlhdCI6MTcyMzIxMjA3NiwiZXhwIjoxNzIzMjE1Njc2fQ.P-Z9rt3NEpKDaPG_QG_n3Nah2sKedAEy35b2k62GW58"
}
```

## JWT 配置

使用配置 `jwt` 配置 JWT 生成选项

```conf
jwt {
  issuer = "http://graphoenix.io" # 签发人
  algorithm = "HS256"             # HS256 / HS384 / HS512
  validityPeriod = 3600           # 有效期(秒)
}
```

## Basic Authentication

使用配置 `security.basicAuthentication` 配置开启 Basic Authentication

```conf
security {
  basicAuthentication = true
}
```

Basic Authentication 令牌使用账号和密码组成

例: 
1. 账号: `root`, 密码: `root`
2. 令牌格式: `root:root`
3. Base64 encoded: `cm9vdDpyb290`
4. 在请求 Headers 中加入 Basic 令牌: ``Authorization: Basic YOUR-BASIC-TOKEN``

```json
{
  "Authorization": "Basic cm9vdDpyb290"
}
```