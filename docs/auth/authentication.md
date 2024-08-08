---
sidebar_position: 1
---

# 认证(Authentication)

认证（Authentication）是一个验证用户身份的过程, 用于确认用户是否为其声称的主体, 用以确保后续操作的安全性和合法性.

Graphoenix 结合 GraphQL 特性, 基于 [JWT](https://github.com/jakartaee/inject) 和 [Casbin](https://casbin.org/) 对认证和授权等安全特性提供支持, 提供轻量级框架: [**Graphence**](https://github.com/doukai/graphence)


## 安装

添加依赖

```gradle
dependencies {
    // highlight-start
    implementation 'org.graphoenix:graphence-core:0.0.1-SNAPSHOT'
    implementation 'org.graphoenix:graphence-security:0.0.1-SNAPSHOT'

    annotationProcessor 'org.graphoenix:graphence-core:0.0.1-SNAPSHOT'
    annotationProcessor 'org.graphoenix:graphence-security:0.0.1-SNAPSHOT'
    // highlight-end
}
```