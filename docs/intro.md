---
sidebar_position: 1
---

# 简介

**Graphoenix**是基于[GraphQL](https://graphql.org/)和[Reactor](https://projectreactor.io/)的 Java 全栈开发平台

## 起源

简单回顾一下我们的开发历程, 过多的时间被浪费在了无意义的重复与拉扯之中

项目的初期阶段

```mermaid
flowchart LR
   a["用户需求"] --> b["后端:数据库设计"] & c["前端:UI设计"] --> d["确定接口"] --> e["后端:CURD"] & f["前端:封装组件"] --> g["对接接口"] --> h["测试"] --> i["交付"]
```

1. 用户需求永远是变量, 需求的变化会引起连锁反应, 最终导致前端和后端在"改 UI"与"改接口"之间反复拉扯
2. 后端的 CURD 是高度重复化的, 使用 Mybaits 非常考验开发人员的 SQL 水平, 业务逻辑过多的隐藏在 SQL 中使得可维护性下降, 也无法利用 IDE 和编译器的检测能力, 即便使用代码生成器或是 Mybatis Plus 等工具依然要在对象关系映射上投入大量精力, 且数据库难以迁移
3. 使用 JPA 为代表的 ORM 技术需要对框架本身有充分的了解, 使用不当极易发生性能问题和缓存问题, 由于 Java 代码的表达能力有限, 复杂的统计依然需要 SQL 补充, 但 JPA 的 SQL 支持不尽人意
4. 对于前端而言, 后端的对于接口的理解经常南辕北辙, 使用 Mock data 封装的组件和状态在接口对接后并不符合预期
5. 后端接口可能难以一次性返回组件所需要的所有数据, 且返回的数据结构不能直接使用, 这时就会产生大量的冗余请求和大量的二次数据封装
6. 大量组件的逻辑是高度重复的, 产生了大量的套娃组件, 使得前端大部分时间沦为 UI 和接口的代码焊接工

---

随着项目的进展, 代码量已经增长到难以维护, 单一的服务逐渐不能继续满足日益增长的用户访问, 服务按照业务拆分

```mermaid
flowchart LR
   a["单体"] --> b["后端A组"] & c["后端B组"] & d["后端C组"] --> e["确定拆分边界"] --> f["后端A: 封装RPC接口"] & g["后端B: 封装RPC接口"] & h["后端C: 封装RPC接口"] --> i["对接RPC接口"] --> j["测试"] --> k["微服务"]
```

1. 理清复杂的对象关系图是困难的, 对象之间的映射关系更是难以剥离, 它们可能隐藏在代码中也可能隐藏在 SQL 中, 未知的风险隐藏在系统的各个角落
2. 接口的变动可能会波及上下游各个服务, 对开发人员的协调难度远远大于对代码的修改
3. 拆分过程往往不可逆, 拆分后的代码在新项目复用时难度极大, 需要大量的基础设施构建
4. 微服务需要大量的基础建设和运维投入, 项目复杂度呈几何式增长

## 新选择

Graphoenix 皆在项目的各个阶段和各个环节提供规范化, 插件化, 可伸缩的解决方案, 充分利用 GraphQL 协议, 打造透明高效的开发流程, 释放 x10 倍的开发效率

### 按需所取

前端和后端把大量的时间浪费在了接口的定义和对接, 前端总是希望得到开箱即用的数据, 而后端则希望模式化的返回数据, Graphonix充分利用GraphQL协议的特性充当中间人, 自动适配数据库, 构建参数和实例化服务, 实时响应前端请求

```mermaid
flowchart LR
    uml[[后端建模]] --> schema
    request --> query -- 请求 --> http
    http -- 响应 --> response --> request
    subgraph Graphoenix
        schema[["// types.graphql
        type Product {
        &emsp;id: ID!
        &emsp;name: String!
        &emsp;price: Float!
        }"]]
        graphql[["// schema.graphql
        schema {
        &emsp;query: Query
        &emsp;mutation: Mutation
        &emsp;subscription: Subscription
        }
        type Query {
        &emsp;product: product
        &emsp;productList: [product]
        &emsp;productConnection: productConnection
        }"]]
        http[["http://sample.gp.com/graphql"]]
        doc[[接口文档]]
        iq[[GraphiQL]]
        schema -- 构建Schema --> graphql -- 构建服务 --> http
        graphql -- 生成 --> doc
        graphql -- 构建 --> iq
    end
    subgraph 前端
        request[前端请求]
        query[["// query.graphql
        query {
        &emsp;product {
        &emsp;&emsp;name
        &emsp;&emsp;price
        &emsp;}
        }"]]
        response[["// response.json
        {
        &emsp;&quot;data&quot;: {
        &emsp;&emsp;&quot;name&quot;: &quot;Laptop&quot;
        &emsp;&emsp;&quot;price&quot;: 999.99
        &emsp;}
        }"]]
    end
    style schema text-align:left
    style graphql text-align:left
    style query text-align:left
    style response text-align:left
```

### SQL转译

对于CURD, Graphoenix实现了对于SQL的转译引擎, 根据GraphQL请求动态转译为SQL, 通过响应式的r2dbc连接与数据库交互, 轻量透明高性能

```mermaid
flowchart LR
    uml[[后端建模]] --> schema[["// types.graphql
    type Product {
    &emsp;id: ID!
    &emsp;name: String!
    &emsp;price: Float!
    }"]] -- 转译 --> ddl[["// schema.sql
    CREATE TABLE IF NOT EXISTS `product` (
    &emsp;`id` INT PRIMARY KEY NOT NULL,
    &emsp;`name` VARCHAR (255) NOT NUL
    &emsp;`price` FLOAT (11,2) NOT NULL
    )"]] --> db[(Database)]
    request[前端请求] --> query[["// query.graphql
    query {
    &emsp;product {
    &emsp;&emsp;name
    &emsp;&emsp;price
    &emsp;}
    }"]] -- 转译 --> dml[["// query.sql
    SELECT JSON_EXTRACT(
    &emsp;JSON_OBJECT( 
    &emsp;&emsp;'name', product_1.`name`, 
    &emsp;&emsp;'price', product_1.`price` 
    &emsp;) , 
    '$') 
    FROM `product` AS product_1"]] --> db
    style schema text-align:left
    style ddl text-align:left
    style dml text-align:left
    style query text-align:left
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
    A -.- AB
    B -.- AB
    A -.- AC
    C -.- AC
    B -.- BC
    C -.- BC
```

### 代码生成

1. 对于后端, Graphoenix插件根据GraphQL定义生成Java Bean, 支持编程方式拓展系统服务
2. 对于前端, Graphoenix代码生成器对每个定义的类型生成通用的Table, Form, Select等UI组件, 自动对接后端接口

```mermaid
flowchart LR
    schema[["// types.graphql
    type Product {
    &emsp;id: ID!
    &emsp;name: String!
    &emsp;price: Float!
    &emsp;+ category: String
    }"]] -- 构建Schema --> graphql((GraphQL服务))
    schema -- 生成代码 --> java[["// Product.java
    public class Product {
    &emsp;@Id;
    &emsp;@NonNull;
    &emsp;private String id;
    &emsp;@NonNull;
    &emsp;private String name;
    &emsp;@NonNull;
    &emsp;private Float price;
    }"]]
    code -- 更新 --> schema
    graphql --> codegen{{代码生成器}}
    ui <-. 请求 .-> graphql
    subgraph 后端
        java -- 引用 --> code[["// ProductApi.java
    @GraphQLApi
    public class ProductApi {
    &emsp;public String category(@Source Product product) {
    &emsp;&emsp;return product.getName().equals(&quot;Laptop&quot;) ? &quot;Digital&quot; : &quot;Other&quot;;
    &emsp;};
    }"]]
    end
    subgraph 前端
        codegen --> ui[["&lt;ProductForm name=&quot;Laptop&quot; price=&quot;999.99&quot; &frasl;&gt;"]]
    end
    style schema text-align:left
    style java text-align:left
    style code text-align:left
```

### 统一校验

相同的校验逻辑需要在前后端重复两次, 效率低下且极易产生差异, Graphoenix编译器根据类型定义, 自动生成[JSON Schema](https://json-schema.org/), 前后端统一校验

```mermaid
flowchart LR
    subgraph Graphoenix
        func[[后端接口]]
        java[validate.java]
        schema[["// types.graphql
            type Product {
            &emsp;id: ID!
            &emsp;name: String!
            &emsp;price: Float!
            }"]] -- 转译 --> jsonSchema[["// json-schema.json
            {
            &emsp;&quot;$id&quot;: &quot;#ProductInput&quot;,
            &emsp;&quot;type&quot;: &quot;object&quot;,
            &emsp;&quot;properties&quot;: {
            &emsp;&emsp;&quot;id&quot;: { &quot;type&quot;: &quot;string&quot; }
            &emsp;&emsp;&quot;name&quot;: { &quot;type&quot;: &quot;string&quot; }
            &emsp;&emsp;&quot;price&quot;: { &quot;type&quot;: &quot;number&quot; }
            &emsp;}
            &emsp;&quot;required&quot;: [ &quot;id&quot;, &quot;name&quot;, &quot;price&quot; ]
            }"]] --> http[[http端口]]
    end
    subgraph 前端
        http <-. 请求(缓存)校验规则 .-> js
        jsonSchema <-. 加载校验规则 .-> java
        form[[前端表单]] <-- 校验 --> js[validate.js]
        js -- 提交 --> func <-- 校验 --> java
    end
    style schema text-align:left
    style jsonSchema text-align:left
```

### 模块化

Graphoenix在GraphQL协议的基础上引入模块化概念, 最大限度复用业务模型, 系统选择合适的模块引用, 像乐高积木一样快速构建产品

```mermaid
flowchart LR
    a("example.package.a
    a.graphql")
    b("example.package.b
    b.graphql")
    c("example.package.c
    c.graphql")
    a-service{{"http://example.gp.com/a/graphql
    A-service"}}
    b-service{{"http://example.gp.com/b/graphql
    B-service"}}
    c-service{{"http://example.gp.com/c/graphql
    C-service"}}
    subgraph A-Schema
        a-schema("a.graphql")
    end
    subgraph B-Schema
        b-schema("a.graphql
        b.graphql")
    end
    subgraph C-Schema
        c-schema("a.graphql
        b.graphql
        c.graphql")
    end
    a -.-> a-schema
    a & b -.-> b-schema
    a & b & c -.-> c-schema
    a-schema --> a-service
    b-schema --> b-service
    c-schema --> c-service
```

### 可伸缩

Graphoenix架构可在项目的不同阶段随意伸缩, 随着项目扩展拆分为微服务, 也可随着项目收缩合并为单体, Graphoenix根据不同架构自动调整底层技术

```mermaid
flowchart LR
    subgraph 编译时
        pkg1([模块1])
        pkg2([模块2])
        pkg3([模块3])
    end
    pkg1 -.-> mono1
    pkg2 -.-> mono2
    pkg3 -.-> mono3
    pkg1 -.-> micro1
    pkg2 -.-> micro2
    pkg3 -.-> micro3
    subgraph 单体运行时
        mono1{{jar1}}
        mono2{{jar2}}
        mono3{{jar3}}
        mono1 <-. invoke .-> mono2
        mono2 <-. invoke .-> mono3
    end
    subgraph 微服务运行时
        micro1{{微服务1}}
        micro2{{微服务2}}
        micro3{{微服务3}}
        micro1 <-. gRPC .-> micro2
        micro2 <-. gRPC .-> micro3
    end
    subgraph 数据库
        db1[(MySQL)]
        db2[(Postgre)]
        db3[(MongoDB)]
    end
    单体运行时 --> db1
    micro1 --> db3
    micro2 --> db2
    micro3 --> db1
```

### 去中心

Graphoenix基于[Gossip 协议](https://icyfenix.cn/distribution/consensus/gossip.html)实现服务发现, 无中心节点, 避免单点故障, 无需复杂的微服务基础设施

```mermaid
flowchart LR
    1((服务1))
    2((服务2))
    3((服务3))
    4((服务4))
    5((服务5))
    6((服务6))
    7((服务7))
    8((服务8))
    9((服务9))
    1 -.-> 2 & 4
    7 -.-> 3
    2 -.-> 3 & 5
    5 -.-> 9
    4 -.-> 6 & 7 & 9
    6 -.-> 5
    2 -.-> 8
```

### 订阅

Graphoenix提供开箱即用, 端到端的订阅服务, 自动侦测数据变动, 通过消息队列推送到后端, 通过SSE推送到前端, 实时掌握数据流动, 对数据敏感型场景提供全面支持

```mermaid
flowchart LR
    request --> mutation -- 提交 --> http
    request --> subscription -- 订阅 --> http
    http -- 推送(SSE) --> response --> request
    subgraph Graphoenix
        mq[(Message Queue)]
        schema[["// types.graphql
        type Product {
        &emsp;id: ID!
        &emsp;name: String!
        &emsp;price: Float!
        }"]]
        graphql[["// schema.graphql
        schema {
        &emsp;query: Query
        &emsp;mutation: Mutation
        &emsp;subscription: Subscription
        }
        type Subscription {
        &emsp;product: product
        &emsp;productList: [product]
        &emsp;productConnection: productConnection
        }"]]
        http[["http://sample.gp.com/graphql"]]
        schema -- 构建Schema --> graphql -- 构建服务 --> http
        http -- 提交 --> mq
        mq -- 推送(MQ) --> http
    end
    subgraph 前端
        request[前端请求]
        mutation[["// mutation.graphql
        mutation {
        &emsp;product(price: &quot;1000.00&quot;, where: {name: &quot;Laptop&quot}) {
        &emsp;&emsp;id
        &emsp;}
        }"]]
        subscription[["// subscription.graphql
        subscription {
        &emsp;product {
        &emsp;&emsp;name
        &emsp;&emsp;price
        &emsp;}
        }"]]
        response[["// response.json
        {
        &emsp;&quot;data&quot;: {
        &emsp;&emsp;&quot;name&quot;: &quot;Laptop&quot;
        &emsp;&emsp;&quot;price&quot;: 1000.00
        &emsp;}
        }"]]
    end
    style schema text-align:left
    style graphql text-align:left
    style subscription text-align:left
    style mutation text-align:left
    style response text-align:left
```

### gRPC

对于跨系统或跨语言远程调用的场景, Graphoenix编译器根据类型定义, 自动生成[protobuf](https://protobuf.dev/), 提供开箱即用gRPC接口

```mermaid
flowchart LR
    uml[[后端建模]]
    grpc((gRPC服务))
    subgraph Graphoenix
        schema[["// types.graphql
            type Product {
            &emsp;id: ID!
            &emsp;name: String!
            &emsp;price: Float!
            }"]] -- 转译 --> protobuf[["// types.proto
            message Product {
            &emsp;optional string id = 1;
            &emsp;optional string name = 2;
            &emsp;optional float price = 3
            }"]] -- 构建 --> service[["// service.proto
            service QueryService {
            &emsp;rpc Product (Request) returns (Response);
            &emsp;rpc ProductList (Request) returns (Response);
            &emsp;rpc ProductConnection (Request) returns (Response);
            }"]]
        style schema text-align:left
        style protobuf text-align:left
        style service text-align:left
    end
    uml --> schema
    service --> grpc
```

_灵感来自[Hasura GraphQL Engine](https://hasura.io/)_
