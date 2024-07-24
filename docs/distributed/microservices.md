---
sidebar_position: 1
---

# 微服务

微服务架构（Microservices Architecture）是一种将单个应用程序分解为多个独立部署的小服务的架构模式, 每个服务专注于特定的业务功能, 具有高内聚和松耦合的特点. 它允许各个服务独立开发, 部署和扩展, 支持灵活的技术选型, 提高系统的弹性和扩展性, 然而微服务架构也带来了系统复杂性增加, 运维成本高, 通信开销大和数据一致性保障难等挑战. 它特别适用于需要高扩展性, 复杂业务逻辑和快速迭代的大规模应用. 选择微服务架构需要权衡其优缺点, 并根据具体的业务需求和技术能力进行决策

Graphoenix 通过不同的包名(Package Name)来区分模块, 每个模块可以独立提供服务, 通过 gRPC 等通讯协议构成微服务架构, 也可以与其他模块合并为后作为单体架构提供服务

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

## 服务拆分

我们将[快速开始](/docs/tutorial/quick-start)中的[订单系统](/docs/tutorial/quick-start#1-定义-graphql)拆分为订单(demo.gp.order), 用户(demo.gp.user), 评论(demo.gp.review)三个子系统

<details>
<summary>项目结构</summary>

```
|-- order-microservices
    |-- build.gradle
    |-- gradle.properties
    |-- settings.gradle
    |-- order-app                               订单系统
    |   |-- build.gradle
    |   |-- src
    |       |-- main
    |           |-- java
    |           |   |-- demo.gp.order
    |           |       |-- App.java
    |           |-- resources
    |               |-- application.conf
    |-- order-package                           订单模块
    |   |-- build.gradle
    |   |-- src
    |       |-- main
    |           |-- java
    |           |   |-- demo.gp.order
    |           |       |-- package-info.java
    |           |-- resources
    |               |-- graphql
    |                   |-- order.gql           定义订单相关类型
    |-- review-app                              评论系统
    |   |-- build.gradle
    |   |-- src
    |       |-- main
    |           |-- java
    |           |   |-- demo.gp.review
    |           |       |-- App.java
    |           |-- resources
    |               |-- application.conf
    |-- review-package                          评论模块
    |   |-- build.gradle
    |   |-- src
    |       |-- main
    |           |-- java
    |           |   |-- demo.gp.review
    |           |       |-- package-info.java
    |           |-- resources
    |               |-- graphql
    |                   |-- review.gql          定义评论相关类型
    |-- user-app                                用户系统
    |   |-- build.gradle
    |   |-- src
    |       |-- main
    |           |-- java
    |           |   |-- demo.gp.user
    |           |       |-- App.java
    |           |-- resources
    |               |-- application.conf
    |-- user-package                            用户模块
        |-- build.gradle
        |-- src
            |-- main
                |-- java
                |   |-- demo.gp.user
                |       |-- package-info.java
                |-- resources
                    |-- graphql
                        |-- user.gql            定义用户相关类型
```

</details>

1. 用户模块中定义用户(User)和用户类型(UserType)
2. 评论模块中定义评论(Review), 评论的评论人字段(user)引用用户模块的用户(User)
3. 订单模块中定义订单(Order)和产品(Product), 订单的购买用户字段(user)引用用户模块的用户(User), 产品的评论列表字段(reviews)引用评论模块的评论(Review)

```mermaid
flowchart LR
    order["// order.gql
    &quot;产品&quot;
    type Product {
    &emsp;&quot;产品ID&quot;
    &emsp;id: ID!
    &emsp;&quot;产品名称&quot;
    &emsp;name: String!
    &emsp;&quot;定价&quot;
    &emsp;price: Float!
    &emsp;&quot;评论列表&quot;
    &emsp;reviews: [Review!]
    }

    &quot;订单&quot;
    type Order {
    &emsp;&quot;订单ID&quot;
    &emsp;id: ID!
    &emsp;&quot;购买用户&quot;
    &emsp;user: User!
    &emsp;&quot;产品列表&quot;
    &emsp;items: [OrderItem!]!
    }

    &quot;订单项&quot;
    type OrderItem {
    &emsp;&quot;订单项ID&quot;
    &emsp;id: ID!
    &emsp;&quot;产品&quot;
    &emsp;product: Product!
    &emsp;&quot;购买数量&quot;
    &emsp;quantity: Int!
    }"]
    review["// review.gql
    &quot;评论&quot;
    type Review {
    &emsp;&quot;评论ID&quot;
    &emsp;id: ID!
    &emsp;&quot;评论内容&quot;
    &emsp;content: String
    &emsp;&quot;评分&quot;
    &emsp;rating: Float!
    &emsp;&quot;评论人&quot;
    &emsp;user: User!
    }"]
    user["// user.gql
    &quot;用户&quot;
    type User {
    &emsp;&quot;用户ID&quot;
    &emsp;id: ID!
    &emsp;&quot;用户名&quot;
    &emsp;name: String!
    &emsp;&quot;电子邮箱&quot;
    &emsp;email: String
    &emsp;&quot;联系方式&quot;
    &emsp;phoneNumbers: [String!]
    &emsp;&quot;用户类型&quot;
    &emsp;userType: UserType!
    }

    &quot;用户类型&quot;
    enum UserType {
    &emsp;&quot;普通用户&quot;
    &emsp;REGULAR
    &emsp;&quot;会员&quot;
    &emsp;VIP
    }"]
    user -. 引用 .-> review
    review -. 引用 .-> order
    user -. 引用 .-> order
    style order text-align:left
    style review text-align:left
    style user text-align:left
```
