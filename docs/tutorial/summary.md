---
sidebar_position: 8
---

# 小结

> Controlling complexity is the essence of computer programming (编程的本质是控制复杂度)&emsp;-- Brian W. Kernighan

目前为止, 从项目的初始化开始, 依次介绍了类型定义, 增删改查(CURD), 订阅, 控制层(GPI)和持久层(GPA), 已经可以满足系统开发的基本需求

Graphoenix 隐藏了所有的细枝末节, 只需定义 GraphQL 类型, 平台会基于最佳实践自动托管数据库, 构建接口和参数, 维护映射关系等. Graphoenix 屏蔽了底层的复杂度, 让开发者专注于业务代码的编写

接下来可以根据实际需求选择其他的平台特性进行了解

1. [依赖注入(IOC)](/docs/jakarta-ee/inject) / [切面(AOP)](/docs/jakarta-ee/interceptor) / [配置(Config)](/docs/jakarta-ee/config): 企业级 Java([Jakarta EE](https://jakarta.ee/))
2. [异步和同步](/docs/jakarta-ee/reactor): 基于 [Reactor](https://projectreactor.io/) 的 Async 和 Await
3. [微服务](/docs/distributed/microservices)和[gRPC](/docs/distributed/grpc): 单体和[微服务](https://microservices.io/)可切换的集装箱架构
4. [校验](/docs/validation/json-schema): 基于 [JSON Schema](https://json-schema.org/) 协议的校验
5. [认证](/docs/auth/authentication)和[授权](/docs/auth/authorization): 基于 [JWT](https://jwt.io/) 的认证和基于 [Casbin](https://casbin.org/) 的授权
6. [UI](/docs/ui/svelte): 基于 [Svelte](https://svelte.dev/) 和 [Tailwind CSS](https://tailwindcss.com/) 的 UI 组件
