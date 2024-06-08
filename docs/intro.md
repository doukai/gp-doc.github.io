---
sidebar_position: 1
---

# 简介

**Graphoenix**是基于[GraphQL](https://graphql.org/)和[Reactor](https://projectreactor.io/)的 Java 全栈开发平台.

## 起源

简单回顾一下我们的开发过程, 过多的时间被浪费在了无意义的重复与拉扯之中

用一张图来简述项目的初期阶段

```mermaid
flowchart LR
   a["用户需求"] --> b["后端:数据库设计"] & c["前端:UI设计"] --> d["确定接口"] --> e["后端:CURD"] & f["前端:封装组件"] --> g["对接接口"] --> h["测试"] --> i["交付"]
```

1. 用户需求永远是变量, 需求的变化会引起连锁反应, 最终导致前端和后端在"改 UI"与"改接口"之间反复拉扯
2. 后端的 CURD 是高度重复化的, 使用 Mybaits 非常考验开发人员的 SQL 水平, 业务逻辑过多的隐藏在 SQL 中使得可维护性下降, 也无法利用 IDE 和编译器的检测能力, 即便使用代码生成器或是 Mybatis Plus 等工具依然要在对象关系映射上投入大量精力, 且数据库难以迁移
3. 使用 JPA 为代表的 ORM 技术需要对框架本身有充分的了解, 使用不当极易发生性能问题和缓存问题, 由于 Java 代码的表达能力有限, 复杂的统计依然需要 SQL 补充, 但 JPA 的 SQL 支持不尽人意
4. 对于前端而言, 后端的对于接口的理解经常南辕北辙, 使用 Mock data 封装的组件和状态在接口对接后并不符合预期
5. 后端接口可能难以一次性返回组件所需要的所有数据, 且返回的数据结构不能直接使用, 这时就会产生大量的冗余请求和大量的数据封装
6. 大量组件的逻辑是高度重复的, 产生了大量的套娃组件, 使得前端大部分时间沦为 UI 和接口的代码焊接工

随着项目的进展, 代码量已经增长到难以维护, 单一的服务逐渐不能继续满足日益增长的用户访问, 这个时候服务需要按照业务进行拆分

```mermaid
flowchart LR
   a["单体"] --> b["后端A组"] & c["后端B组"] & d["后端C组"] --> e["确定拆分边界"] --> f["后端A:封装RPC接口"] & g["后端B:封装RPC接口"] & h["后端C:封装RPC接口"] --> i["对接RPC接口"] --> j["测试"] --> k["微服务"]
```

1. 理清复杂的对象关系图是困难的, 对象之间的映射关系更是难以剥离, 它们可能隐藏在代码中也可能隐藏在 SQL 中, 未知的风险隐藏在系统的各个角落
2. 接口的变动可能会波及上下游各个服务, 对开发人员的协调难度远远大于对代码的修改
3. 拆分过程往往不可逆, 拆分后的代码在新项目复用时难度极大, 需要大量的基础设施构建
4. 微服务需要大量的运维投入, 部署和运维的复杂度呈几何式增长

## 新选择

Graphoenix 皆在在项目的各个阶段和各个环节提供规范化, 插件化, 可伸缩的解决方案, 充分利用 GraphQL 协议, 打造透明高效的开发流程, 释放 x10 倍的开发效率

### 按需所取

我们发现, 前端和后端把大量的时间浪费在了接口的定义和对接, 前端总是希望得到开箱即用的数据, 而后端则希望模式化的返回数据, Graphonix充分利用GraphQL协议的特性充当中间人, 自动适配数据库, 构建参数和实例化服务, 实时响应前端请求

```mermaid
flowchart LR
    a["用户需求"] --> uml[[后端建模]] -- 定义对象与关系 --> schema((GraphQL定义))
    graphql((GraphQL服务)) -- 按需返回 --> web[[前端组件]]
    web -. 按需查询 .-> graphql((GraphQL服务))
    subgraph Graphoenix
        schema -- 构建参数和服务 --> graphql
    end
```

### SQL引擎

对于CURD, Graphoenix实现了对于SQL的转译引擎, 根据GraphQL请求动态转译为SQL, 通过响应式的r2dbc连接与数据库交互, 轻量透明高性能

```mermaid
flowchart LR
    schema((GraphQL定义)) -- DDL --> db[(Database)]
    db[(Database)] -- Rows --> graphql((GraphQL服务))
    graphql -- DML --> db
    graphql((GraphQL服务)) -- JSON --> request((GraphQL请求))
    request -- Operation --> graphql
```

### 关系构建

得益于GraphQL对于图关系的描述能力, Graphoenix可以自动构建和托管对象关系

```mermaid
flowchart LR
    A((A)) --> gp((Graphoenix))
    B((B)) --> gp((Graphoenix))
    C((C)) --> gp((Graphoenix))
    gp((Graphoenix)) -- 生成 --> AB((AB))
    gp((Graphoenix)) -- 生成 --> AC((AC))
    gp((Graphoenix)) -- 生成 --> BC((BC))
    A -.-> AB
    B -.-> AB
    A -.-> AC
    C -.-> AC
    B -.-> BC
    C -.-> BC
```

### 代码生成

1. 对于后端, 插件可以根据GraphQL定义生成Java Bean, 支持编程方式补充和拓展系统服务
2. 对于前端, 代码生成器对每个对象生成通用的Table, Form, Select等UI组件, 自动对接后端接口

```mermaid
flowchart LR
    schema((GraphQL定义)) --> graphql((GraphQL服务)) --> introspection((内省服务))
    schema -- 生成代码 --> java[[Bean.java]]
    code -- 更新 --> schema
    introspection --> codegen{{代码生成器}}
    ui <-. 请求 .-> graphql
    subgraph 后端
        java -- 引用 --> code[[业务代码.java]]
    end
    subgraph 前端
        codegen --> ui[[组件.svelte]]
    end
```

```mermaid
flowchart LR
    uml[[领域建模]]
    schema((GraphQL定义))
    graphql((GraphQL服务))
    r2dbc{{r2dbc连接器}}
    sql{{SQL转译器}}
    mongodb{{MongoDB连接器}}
    subscription((订阅服务))
    http((Http端口))
    grpc((gRPC端口))
    introspection((内省服务))
    authentication[/鉴权服务/]
    authorization[/授权服务/]
    validate((验证服务))
    doc[[接口文档]]
    codegen{{代码生成器}}
    web[[前端代码]]
    app[[App代码]]
    security((安全服务))
    uml --> schema
    schema --> compiler
    introspection --> doc
    graphql --> subscription
    graphql --> introspection --> codegen --> web & app
    graphql --> http & grpc
    http --> validate
    introspection --> security --> authentication & authorization
    compiler --> java --> packager
    compiler --> protobuf -.-> grpc
    compiler --> jsonSchema -.-> validate
    mq1 -. 推送 .-> subscription
    mq2 -. 定时拉取 .-> subscription
    db2 & db1 --> r2dbc --> sql --> graphql
    db3 --> mongodb --> graphql
    subgraph 编译时
    packager{{打包器}}
    pkg1([模块1])
    pkg2([模块2])
    pkg3([模块3])
    packager --> pkg1
    packager --> pkg2
    packager --> pkg3
    compiler{{编译器}}
    jsonSchema([json-schema])
    protobuf([protobuf])
    java([java代码])
    end
    subgraph 单体运行时
    mono{{单体服务}}
    pkg1 -.-> mono
    pkg2 -.-> mono
    pkg3 -.-> mono
    end
    subgraph 微服务运行时
    micro1{{微服务1}}
    micro2{{微服务2}}
    micro3{{微服务3}}
    pkg1 -.-> micro1
    pkg2 -.-> micro2
    pkg3 -.-> micro3
    end
    subgraph 消息队列
    mq1[(RabbitMQ)]
    mq2[(Kafka)]
    end
    subgraph 数据库
    db1[(MySQL)]
    db2[(Postgre)]
    db3[(MongoDB)]
    mono -.-> mq1
    mono --> db1
    micro1 -.-> mq2
    micro2 -.-> mq2
    micro3 -.-> mq2
    micro1 --> db1
    micro2 --> db2
    micro3 --> db3
    micro1 <-. gRPC .-> micro2
    micro2 <-. gRPC .-> micro3
    micro1 <-. gossip .-> micro2
    micro2 <-. gossip .-> micro3
    end
```

_灵感来自[Hasura GraphQL Engine](https://hasura.io/)_
