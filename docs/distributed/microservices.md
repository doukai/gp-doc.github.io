---
sidebar_position: 1
---

# 微服务

微服务架构（[Microservices Architecture](https://microservices.io/)）是一种将单个应用程序分解为多个独立部署的小服务的架构模式, 每个服务专注于特定的业务功能, 具有高内聚和松耦合的特点. 它允许各个服务独立开发, 部署和扩展, 支持灵活的技术选型, 提高系统的弹性和扩展性. 然而微服务架构也带来了系统复杂性增加, 运维成本高, 通信开销大和数据一致性保障难等挑战

Graphoenix 全面支持微服务架构, 提供服务注册, 网关, 熔断, 负载均衡, [事务补偿](#事务补偿)等全套的微服务解决方案. 系统通过不同的包名(Package Name)来区分模块, 每个模块可以独立提供服务, 通过 gRPC 等通讯协议构成微服务矩阵, 也可以与其他模块合并为单体架构提供服务

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

微服务的拆分是将一个单体应用分解为多个独立部署的小服务, 每个服务专注于特定业务功能. 通过领域驱动设计(DDD), 业务功能划分, 独立数据库, 独立部署和服务通信, 实现更好的隔离和独立性

例: 我们将[快速开始](/docs/tutorial/quick-start)中的[订单系统](/docs/tutorial/quick-start#1-定义-graphql)拆分为订单(demo.gp.order), 用户(demo.gp.user), 评论(demo.gp.review)三个子系统

### 模块和服务

项目按照功能分为模块(package)和服务(app), 服务作为模块的载体, 按照不同的组合方式构建单体架构或微服务矩阵:

1. app(package1 + package2 + package3) = monolithic
2. app1(package1) + app2(package2) + app3(package3) = microservices

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

```mermaid
flowchart LR
    subgraph order-app
      subgraph demo.gp.order
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
      end
    end
    subgraph review-app
      subgraph demo.gp.review
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
      end
    end
    subgraph user-app
      subgraph demo.gp.user
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
      end
    end
    user -. 引用 .-> review
    review -. 引用 .-> order
    user -. 引用 .-> order
    style order text-align:left
    style review text-align:left
    style user text-align:left
```

1. 用户模块中定义用户(User)和用户类型(UserType)
2. 评论模块中定义评论(Review), 评论的评论人字段(user)引用用户模块的用户(User)
3. 订单模块中定义订单(Order)和产品(Product), 订单的购买用户字段(user)引用用户模块的用户(User), 产品的评论列表字段(reviews)引用评论模块的评论(Review)

## 安装

### protobuf 插件

模块之间默认使用 gRPC 进行通讯, 需要引用插件生成 protobuf 文件

<details>
<summary>user-package</summary>

```gradle title="build.gradle"
buildscript {
    repositories {
        jcenter()
    }
}

plugins {
    id 'java'
    // highlight-start
    id 'com.google.protobuf' version '0.9.1'
    // highlight-end
    id "org.graphoenix" version "0.1.1"
}

classes {
    dependsOn generateGraphQLSource
    // highlight-start
    dependsOn generateProtobufV3
    // highlight-end
}
```

生成 DTO 和 protobuf

```bash
./gradlew :user-package:build
```

</details>

<details>
<summary>review-package</summary>

```gradle title="build.gradle"
buildscript {
    repositories {
        jcenter()
    }
}

plugins {
    id 'java'
    // highlight-start
    id 'com.google.protobuf' version '0.9.1'
    // highlight-end
    id "org.graphoenix" version "0.1.1"
}

classes {
    dependsOn generateGraphQLSource
    // highlight-start
    dependsOn generateProtobufV3
    // highlight-end
}
```

生成 DTO 和 protobuf

```bash
./gradlew :review-package:build
```

</details>

<details>
<summary>order-package</summary>

```gradle title="build.gradle"
buildscript {
    repositories {
        jcenter()
    }
}

plugins {
    id 'java'
    // highlight-start
    id 'com.google.protobuf' version '0.9.1'
    // highlight-end
    id "org.graphoenix" version "0.1.1"
}

classes.dependsOn {
    generateGraphQLSource
    // highlight-start
    generateProtobufV3
    // highlight-end
}
```

生成 DTO 和 protobuf

```bash
./gradlew :order-package:build
```

</details>

### 模块(package)依赖

安装和配置 gRPC, 引用其他模块

<details>
<summary>user-package</summary>

```gradle title="build.gradle"
// highlight-start
// gRPC 配置
protobuf {
    protoc {
        artifact = 'com.google.protobuf:protoc:3.21.7'
    }
    plugins {
        grpc {
            artifact = 'io.grpc:protoc-gen-grpc-java:1.52.1'
        }
        reactor {
            artifact = 'com.salesforce.servicelibs:reactor-grpc:1.2.3'
        }
    }
    generateProtoTasks {
        all()*.plugins {
            grpc {}
            reactor {}
        }
    }
}
// highlight-end

// highlight-start
// gRPC 目录配置
sourceSets {
    main {
        java {
            srcDirs 'build/generated/source/proto/main/java'
            srcDirs 'build/generated/source/proto/main/grpc'
            srcDirs 'build/generated/source/proto/main/reactor'
        }
    }
}
// highlight-end

dependencies {
    // highlight-start
    // gRPC 依赖
    runtimeOnly 'io.grpc:grpc-netty-shaded:1.52.1'
    implementation 'io.grpc:grpc-protobuf:1.52.1'
    implementation 'io.grpc:grpc-stub:1.52.1'
    implementation 'com.salesforce.servicelibs:reactor-grpc-stub:1.2.3'
    compileOnly 'org.apache.tomcat:annotations-api:6.0.53' // necessary for Java 9+
    // highlight-end

    // ...
}
```

</details>

<details>
<summary>review-package</summary>

```gradle title="build.gradle"
// highlight-start
// gRPC 配置
protobuf {
    protoc {
        artifact = 'com.google.protobuf:protoc:3.21.7'
    }
    plugins {
        grpc {
            artifact = 'io.grpc:protoc-gen-grpc-java:1.52.1'
        }
        reactor {
            artifact = 'com.salesforce.servicelibs:reactor-grpc:1.2.3'
        }
    }
    generateProtoTasks {
        all()*.plugins {
            grpc {}
            reactor {}
        }
    }
}
// highlight-end

// highlight-start
// gRPC 目录配置
sourceSets {
    main {
        java {
            srcDirs 'build/generated/source/proto/main/java'
            srcDirs 'build/generated/source/proto/main/grpc'
            srcDirs 'build/generated/source/proto/main/reactor'
        }
    }
}
// highlight-end

dependencies {
    // highlight-start
    // 引用 User 模块
    implementation project(':user-package')
    // highlight-end

    // highlight-start
    // gRPC 依赖
    runtimeOnly 'io.grpc:grpc-netty-shaded:1.52.1'
    implementation 'io.grpc:grpc-protobuf:1.52.1'
    implementation 'io.grpc:grpc-stub:1.52.1'
    implementation 'com.salesforce.servicelibs:reactor-grpc-stub:1.2.3'
    compileOnly 'org.apache.tomcat:annotations-api:6.0.53' // necessary for Java 9+
    // highlight-end

    // highlight-start
    // 引用 User 模块
    annotationProcessor project(':user-package')
    // highlight-end

    // highlight-start
    // 引用 User 模块
    protobuf project(':user-package')
    // highlight-end

    // ...
}
```

</details>

<details>
<summary>order-package</summary>

```gradle title="build.gradle"
// highlight-start
// gRPC 配置
protobuf {
    protoc {
        artifact = 'com.google.protobuf:protoc:3.21.7'
    }
    plugins {
        grpc {
            artifact = 'io.grpc:protoc-gen-grpc-java:1.52.1'
        }
        reactor {
            artifact = 'com.salesforce.servicelibs:reactor-grpc:1.2.3'
        }
    }
    generateProtoTasks {
        all()*.plugins {
            grpc {}
            reactor {}
        }
    }
}
// highlight-end

// highlight-start
// gRPC 目录配置
sourceSets {
    main {
        java {
            srcDirs 'build/generated/source/proto/main/java'
            srcDirs 'build/generated/source/proto/main/grpc'
            srcDirs 'build/generated/source/proto/main/reactor'
        }
    }
}
// highlight-end

dependencies {
    // highlight-start
    // 引用 User 模块
    implementation project(':user-package')
    // 引用 Review 模块
    implementation project(':review-package')
    // highlight-end

    // highlight-start
    // gRPC 依赖
    runtimeOnly 'io.grpc:grpc-netty-shaded:1.52.1'
    implementation 'io.grpc:grpc-protobuf:1.52.1'
    implementation 'io.grpc:grpc-stub:1.52.1'
    implementation 'com.salesforce.servicelibs:reactor-grpc-stub:1.2.3'
    compileOnly 'org.apache.tomcat:annotations-api:6.0.53' // necessary for Java 9+
    // highlight-end

    // highlight-start
    // 引用 User 模块
    annotationProcessor project(':user-package')
    // 引用 Review 模块
    annotationProcessor project(':review-package')
    // highlight-end

    // highlight-start
    // 引用 User 模块
    protobuf project(':user-package')
    // 引用 Review 模块
    protobuf project(':review-package')
    // highlight-end

    // ..
}
```

</details>

### 服务(app)依赖

引用模块, 安装服务依赖

<details>
<summary>user-app</summary>

```gradle title="build.gradle"
dependencies {
    // highlight-start
    // User 模块
    implementation project(':user-package')
    // highlight-end

    // highlight-start
    // Http 服务
    implementation 'org.graphoenix:graphoenix-http-server:0.1.4'
    // gRPC 服务
    implementation 'org.graphoenix:graphoenix-grpc-server:0.1.4'
    // highlight-end

    // highlight-start
    // User 模块
    annotationProcessor project(':user-package')
    // highlight-end

    // highlight-start
    // gRPC 服务
    annotationProcessor 'org.graphoenix:graphoenix-grpc-server:0.1.4'
    // highlight-end

    // ...
}
```

</details>

<details>
<summary>review-app</summary>

```gradle title="build.gradle"
dependencies {
    // highlight-start
    // User 模块
    implementation project(':user-package')
    // Review 模块
    implementation project(':review-package')
    // highlight-end

    // highlight-start
    // Http 服务
    implementation 'org.graphoenix:graphoenix-http-server:0.1.4'
    // gRPC 服务
    implementation 'org.graphoenix:graphoenix-grpc-server:0.1.4'
    // gRPC 客户端, 调用其他模块
    implementation 'org.graphoenix:graphoenix-grpc-client:0.1.3'
    // highlight-end

    // highlight-start
    // User 模块
    annotationProcessor project(':user-package')
    // Review 模块
    annotationProcessor project(':review-package')
    // highlight-end

    // highlight-start
    // gRPC 服务
    annotationProcessor 'org.graphoenix:graphoenix-grpc-server:0.1.4'
    // gRPC 客户端, 调用其他模块
    annotationProcessor 'org.graphoenix:graphoenix-grpc-client:0.1.3'
    // highlight-end

    // ...
}
```

</details>

<details>
<summary>order-app</summary>

```gradle title="build.gradle"
dependencies {
    // highlight-start
    // User 模块
    implementation project(':user-package')
    // Review 模块
    implementation project(':review-package')
    // Order 模块
    implementation project(':order-package')
    // highlight-end

    // highlight-start
    // Http 服务
    implementation 'org.graphoenix:graphoenix-http-server:0.1.4'
    // gRPC 服务
    implementation 'org.graphoenix:graphoenix-grpc-server:0.1.4'
    // gRPC 客户端, 调用其他模块
    implementation 'org.graphoenix:graphoenix-grpc-client:0.1.3'
    // highlight-end

    // highlight-start
    // User 模块
    annotationProcessor project(':user-package')
    // Review 模块
    annotationProcessor project(':review-package')
    // Order 模块
    annotationProcessor project(':order-package')
    // highlight-end

    // highlight-start
    // gRPC 服务
    annotationProcessor 'org.graphoenix:graphoenix-grpc-server:0.1.4'
    // gRPC 客户端, 调用其他模块
    annotationProcessor 'org.graphoenix:graphoenix-grpc-client:0.1.3'
    // highlight-end

    // ...
}
```

</details>

## 配置

### 配置数据库和服务

```conf title="user-app/src/main/resources/application.conf"
r2dbc {
  driver = "mariadb"
  database = "user"
  user = "root"
  password = "root"
}
http {
  port = 8082   //Http 端口
}
grpc {
  port = 50053  //gRPC 端口
}
```

```conf title="review-app/src/main/resources/application.conf"
r2dbc {
  driver = "mariadb"
  database = "review"
  user = "root"
  password = "root"
}
http {
  port = 8081   //Http 端口
}
grpc {
  port = 50052  //gRPC 端口
}
```

```conf title="order-app/src/main/resources/application.conf"
r2dbc {
  driver = "mariadb"
  database = "order"
  user = "root"
  password = "root"
}
http {
  port = 8080   //Http 端口
}
grpc {
  port = 50051  //gRPC 端口
}
```

### 配置模块地址

使用 `package.members` 配置每个模块的地址, 每个模块都可以提供多个服务作为冗余

```conf title="review-app/src/main/resources/application.conf"
package {
  members: {"demo.gp.user": [{host: "127.0.0.1", port: 50053, protocol: "GRPC"}]}
}
```

```conf title="order-app/src/main/resources/application.conf"
package {
  members: {"demo.gp.review": [{host: "127.0.0.1", port: 50052, protocol: "GRPC"}], "demo.gp.user": [{host: "127.0.0.1", port: 50053, protocol: "GRPC"}]}
}
```

## Gossip

随着项目规模的发展, 微服务节点逐步增长, 需要引入一种自动注册机制来替代手动配置. Graphoenix 使用 [Gossip](https://icyfenix.cn/distribution/consensus/gossip.html) 协议进行服务发现. [Gossip](https://icyfenix.cn/distribution/consensus/gossip.html) 协议是一种用于分布式系统中信息传播和数据一致性的协议, 具有去中心化, 容错性强, 渐进一致性和易扩展等特性, 是确保节点间信息同步和一致性的关键技术

### 安装 Gossip 依赖

```gradle
dependencies {
    // highlight-start
    implementation 'org.graphoenix:graphoenix-gossip:0.1.3'
    // highlight-end

    // highlight-start
    annotationProcessor 'org.graphoenix:graphoenix-gossip:0.1.3'
    // highlight-end

    // ...
}
```

### 配置 Gossip 端口

```conf title="user-app/src/main/resources/application.conf"
gossip {
  port = 3000
}
```

```conf title="review-app/src/main/resources/application.conf"
gossip {
  port = 3001
}
```

```conf title="order-app/src/main/resources/application.conf"
gossip {
  port = 3002
}
```

### 配置种子节点

使用 `package.members.seeds` 配置种子节点, 所有节点都会从种子节点开始交换信息

例: 使用用户模块(demo.gp.user)节点作为种子节点

```conf title="review-app/src/main/resources/application.conf"
package {
  //  members: {"demo.gp.user": [{host: "127.0.0.1", port: 50053, protocol: "GRPC"}]}
  // highlight-start
  members: {seeds: [{host: "127.0.0.1", port: 3000}]}
  // highlight-end
}
```

```conf title="order-app/src/main/resources/application.conf"
package {
  //  members: {"demo.gp.review": [{host: "127.0.0.1", port: 50052, protocol: "GRPC"}], "demo.gp.user": [{host: "127.0.0.1", port: 50053, protocol: "GRPC"}]}
  // highlight-start
  members: {seeds: [{host: "127.0.0.1", port: 3000}]}
  // highlight-end
}
```

## 事务补偿

在微服务架构下, Graphoenix 通过事务补偿([TCC](https://www.thebyte.com.cn/distributed-system/TCC.html))保持数据一致性.

```mermaid
flowchart LR
    micro1{{微服务1}}
    micro2{{微服务2}}
    micro3{{微服务3}}
    success1(成功)
    success2(成功)
    success3(成功)
    error1(异常)
    error2(异常)
    error3(异常)
    db1[(MySQL)]
    db2[(Postgre)]
    db3[(MongoDB)]
    error1 == 事务补偿 ==> micro2 & micro3
    micro1 -- 调用 --> micro2 --> success2
    micro2 -.-> error2 -. 回滚 .-> db2
    error2 -.-> error1

    micro1 -.-> error1 -. 回滚 .-> db1
    micro1 --> success1 -- 提交 --> db1

    success2 -- 调用 --> micro3 --> success3 -- 提交 --> db3
    success2 -- 提交 --> db2
    micro3 -.-> error3 -. 回滚 .-> db3
    error3 -.-> error1
```

使用 `mutation.compensatingTransaction` 配置开启事务补偿

```conf
mutation {
  compensatingTransaction = true
}
```

## 微服务启动

1. Run/Debug user-app/src/main/java/demo/gp/user/App.java
2. Run/Debug review-app/src/main/java/demo/gp/review/App.java
3. Run/Debug order-app/src/main/java/demo/gp/order/App.java

![start](./img/start.png "start")

---

## 服务合并

在业务收缩阶段或是流量低谷时段, 多个模块可以合并为单一服务来降低通信和硬件等成本

### 配置本地模块

使用 `package.localPackageNames` 配置本地模块, 本地模块将和到主模块合并到同一服务中

例: 订单模块(demo.gp.order)引入评论模块(demo.gp.review)和用户模块(demo.gp.user)

```conf title="order-app/src/main/resources/application.conf"
package {
  //  members: {"demo.gp.review": [{host: "127.0.0.1", port: 50052, protocol: "GRPC"}], "demo.gp.user": [{host: "127.0.0.1", port: 50053, protocol: "GRPC"}]}
  //  members: {seeds: [{host: "127.0.0.1", port: 3080}]}
  // highlight-start
  localPackageNames = ["demo.gp.review", "demo.gp.user"]
  // highlight-end
}
```

```mermaid
flowchart TB
    subgraph order-app
      subgraph demo.gp.order
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
      end
      subgraph demo.gp.review
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
      end
      subgraph demo.gp.user
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
      end
    end
    user -. 引用 .-> review
    review -. 引用 .-> order
    user -. 引用 .-> order
    style order text-align:left
    style review text-align:left
    style user text-align:left
```

## 单体服务启动

Run/Debug order-app/src/main/java/demo/gp/order/App.java

![start](./img/start.png "start")

---

## 查询和变更

架构的切换不会影响查询和变更的使用, Graphoenix 通过底层技术屏蔽不同架构的差异, 让接口层的表现保持一致

<details>
<summary>测试数据</summary>

```graphql
mutation {
  userList(
    list: [
      { id: "1", name: "Alice", email: "alice@example.com", userType: VIP }
      { id: "2", name: "Bob", email: "bob@example.com", userType: REGULAR }
      { id: "3", name: "Charlie", email: "charlie@example.com", userType: VIP }
      { id: "4", name: "Diana", email: "diana@example.com", userType: REGULAR }
      { id: "5", name: "Edward", email: "edward@example.com", userType: VIP }
      { id: "6", name: "Fiona", email: "fiona@example.com", userType: REGULAR }
      { id: "7", name: "George", email: "george@example.com", userType: VIP }
      {
        id: "8"
        name: "Hannah"
        email: "hannah@example.com"
        userType: REGULAR
      }
      { id: "9", name: "Ian", email: "ian@example.com", userType: VIP }
      { id: "10", name: "Jane", email: "jane@example.com", userType: REGULAR }
      { id: "11", name: "Kyle", email: "kyle@example.com", userType: VIP }
      { id: "12", name: "Laura", email: "laura@example.com", userType: REGULAR }
      { id: "13", name: "Mike", email: "mike@example.com", userType: VIP }
      { id: "14", name: "Nina", email: "nina@example.com", userType: REGULAR }
      { id: "15", name: "Oliver", email: "oliver@example.com", userType: VIP }
      { id: "16", name: "Paula", email: "paula@example.com", userType: REGULAR }
      { id: "17", name: "Quentin", email: "quentin@example.com", userType: VIP }
      {
        id: "18"
        name: "Rachel"
        email: "rachel@example.com"
        userType: REGULAR
      }
      { id: "19", name: "Steve", email: "steve@example.com", userType: VIP }
      { id: "20", name: "Tina", email: "tina@example.com", userType: REGULAR }
    ]
  ) {
    id
  }
  reviewList(
    list: [
      {
        id: "1"
        content: "Great laptop, very fast and reliable."
        rating: 5
        user: { where: { id: { val: "10" } } }
      }
      {
        id: "2"
        content: "Decent laptop but a bit expensive."
        rating: 4
        user: { where: { id: { val: "8" } } }
      }
      {
        id: "3"
        content: "The phone is amazing, camera quality is top-notch."
        rating: 5
        user: { where: { id: { val: "6" } } }
      }
      {
        id: "4"
        content: "Tablet is good for the price."
        rating: 4
        user: { where: { id: { val: "4" } } }
      }
    ]
  ) {
    id
  }
  productList(
    list: [
      {
        id: "1"
        name: "Laptop"
        price: 999.99
        reviews: [
          { where: { id: { val: "1" } } }
          { where: { id: { val: "2" } } }
        ]
      }
      {
        id: "2"
        name: "Phone"
        price: 499.99
        reviews: [{ where: { id: { val: "3" } } }]
      }
      {
        id: "3"
        name: "Tablet"
        price: 299.99
        reviews: [{ where: { id: { val: "4" } } }]
      }
      { id: "4", name: "Monitor", price: 199.99 }
      { id: "5", name: "Keyboard", price: 49.99 }
    ]
  ) {
    id
  }
  orderList(
    list: [
      {
        user: { where: { id: { val: "1" } } }
        items: [
          { product: { where: { id: { val: "1" } } }, quantity: 1 }
          { product: { where: { id: { val: "3" } } }, quantity: 2 }
        ]
      }
      {
        user: { where: { id: { val: "2" } } }
        items: [{ product: { where: { id: { val: "2" } } }, quantity: 1 }]
      }
      {
        user: { where: { id: { val: "3" } } }
        items: [
          { product: { where: { id: { val: "4" } } }, quantity: 2 }
          { product: { where: { id: { val: "5" } } }, quantity: 3 }
        ]
      }
      {
        user: { where: { id: { val: "4" } } }
        items: [
          { product: { where: { id: { val: "1" } } }, quantity: 1 }
          { product: { where: { id: { val: "2" } } }, quantity: 1 }
          { product: { where: { id: { val: "3" } } }, quantity: 1 }
        ]
      }
    ]
  ) {
    id
  }
}
```

</details>

1. 例: 查询用户 Alice 的订单

```graphql
{
  orderList(user: { name: { val: "Alice" } }) {
    items {
      product {
        name
      }
      quantity
    }
  }
}
```

```json
{
  "data": {
    "orderList": [
      {
        "items": [
          {
            "product": {
              "name": "Laptop"
            },
            "quantity": 1
          },
          {
            "product": {
              "name": "Tablet"
            },
            "quantity": 2
          }
        ]
      }
    ]
  }
}
```

2. 例: 查询评价 4 分以上的产品

```graphql
{
  productList(reviews: { rating: { opr: GT, val: 4 } }) {
    name
    price
    reviews {
      content
      rating
      user {
        name
      }
    }
  }
}
```

```json
{
  "data": {
    "productList": [
      {
        "name": "Laptop",
        "price": 999.99,
        "reviews": [
          {
            "content": "Great laptop, very fast and reliable.",
            "rating": 5,
            "user": {
              "name": "Jane"
            }
          },
          {
            "content": "Decent laptop but a bit expensive.",
            "rating": 4,
            "user": {
              "name": "Hannah"
            }
          }
        ]
      },
      {
        "name": "Phone",
        "price": 499.99,
        "reviews": [
          {
            "content": "The phone is amazing, camera quality is top-notch.",
            "rating": 5,
            "user": {
              "name": "Fiona"
            }
          }
        ]
      }
    ]
  }
}
```

3. 例: 同时新增产品, 评论和用户

```graphql
mutation {
  product(
    name: "Mouse"
    price: 25.99
    reviews: [
      {
        content: "Been using this mouse for quite some time with no concerns. "
        rating: 4
        user: { name: "Victor", userType: VIP }
      }
    ]
  ) {
    name
    price
    reviews {
      content
      rating
      user {
        name
        userType
      }
    }
  }
}
```

```json
{
  "data": {
    "product": {
      "name": "Mouse",
      "price": 25.99,
      "reviews": [
        {
          "content": "Been using this mouse for quite some time with no concerns. ",
          "rating": 4,
          "user": {
            "name": "Victor",
            "userType": "VIP"
          }
        }
      ]
    }
  }
}
```

## _本节示例_

https://github.com/doukai/order-microservices
