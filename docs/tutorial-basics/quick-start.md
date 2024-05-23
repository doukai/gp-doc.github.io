---
sidebar_position: 1
---

# 快速开始

我们基于一个订单系统的开发,逐步展示以下特性:
1. [GraphQL类型](https://graphql.org/learn/schema/)的定义
2. [GraphQL的查询,变更](https://graphql.org/learn/queries/)和[订阅](https://graphql.org/blog/2015-10-16-subscriptions/)
3. GPA-based (GraphQL Persistence API) repositories
4. 基于[MicroProfile](https://microprofile.io/)和[Jakarta EE](https://jakarta.ee/specifications/)协议的依赖注入,切面和配置
5. 异步(Async)和同步(Await)
6. 基于[Gossip](https://icyfenix.cn/distribution/consensus/gossip.html)协议的分布式和[gRPC](https://grpc.io/)通讯
7. 基于[JWT](https://jwt.io/)和[Casbin](https://casbin.org/)定制的鉴权与授权
8. 基于[Svelte](https://svelte.dev/)和[Tailwind CSS](https://tailwindcss.com/)定制的UI界面

### 系统要求

- [JDK >= 11.0](https://www.oracle.com/in/java/technologies/javase/jdk11-archive-downloads.html/)
- [MariaDB >= 10.6.0](https://mariadb.com/kb/en/mariadb-1060-release-notes/) 或 [MySQL >= 8.0](https://dev.mysql.com/downloads/mysql/8.0.html/)
- [RabbitMQ >= 3.0](https://www.rabbitmq.com/docs/download/) (可选)

## 初始化项目

推荐使用官方脚手架快速初始化项目 **[Graphoenix Server Initializer](https://gp-init.github.io)**.

Graphoenix使用[Gradle](https://docs.gradle.org/6.9.4/userguide/userguide.html)进行构建,未来会推出Maven版本:

项目结构:
```
|-- order
    |-- build.gradle
    |-- gradle.properties
    |-- settings.gradle
    |-- order-app                             启动器,引入订单和其他包
    |   |-- build.gradle
    |   |-- src
    |       |-- main
    |           |-- java
    |           |   |-- demo.gp.order
    |           |       |-- App.java          启动类
    |           |-- resources
    |               |-- application.conf      配置文件
    |-- order-package                         订单包 
    |   |-- build.gradle
    |   |-- src
    |       |-- main
    |           |-- java
    |           |   |-- demo.gp.order
    |           |       |-- package-info.java package-info所在目录作为包名
    |           |-- resources
    |               |-- graphql
    |                   |-- order.gql         定义订单相关类型
    |-- other-package                         其他包
        |-- build.gradle
        |-- src
            |-- main
                |-- java
                |   |-- demo.gp.other
                |       |-- package-info.java package-info所在目录作为包名
                |-- resources
                    |-- graphql
                        |-- other.gql         定义其他相关类型
```
如上所示,app项目引入order和other两个包,如同货轮(app)和集装箱(order,other).


### 配置包
1. 引入依赖与Gradle插件
```gradle title="order-package/build.gradle"
buildscript {
    repositories {
        gradlePluginPortal()
        jcenter()
    }
    dependencies {
        classpath 'io.graphoenix:graphoenix-gradle-plugin:0.0.1-SNAPSHOT'
    }
}

apply plugin: 'io.graphoenix'

repositories {
    mavenCentral()
    jcenter() //Graphoenix的反编译器jd-core发布在jcenter,未来反编译器将替换为IDEA使用的fernflower,之后不再依赖
}

dependencies {
    implementation 'io.graphoenix:graphoenix-core:0.0.1-SNAPSHOT' //核心
    implementation 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'  //依赖注入
    implementation 'io.nozdormu:nozdormu-config:0.0.1-SNAPSHOT'  //配置

    annotationProcessor 'io.graphoenix:graphoenix-annotation-processor:0.0.1-SNAPSHOT' //核心编译器
    //implementation依赖全部加入到annotationProcessor
    annotationProcessor 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'
    annotationProcessor 'io.nozdormu:nozdormu-config:0.0.1-SNAPSHOT'
}
```

2. 定义GraphQL Schema,关于GraphQL的基础知识,可以参考[GraphQL官方教程](https://graphql.org/learn/)

定义订单和货物
```graphql title="order-package/src/main/resources/graphql/order.gql"
"订单"
type Order {
    "ID"
    id: ID
    "订单编码"
    number: String!
    "购买货物"
    goods: [Good!]
}

"货物信息"
type Good {
    "ID"
    id: ID
    "货物名称"
    name: String!
    "定价"
    price: Float!
}
```

3. 生成Java Bean
```bash
./gradlew :order-package:generateGraphQLSource 
```
或使用IDEA

![generateGraphQLSource](./img/generateGraphQLSource.png "generateGraphQLSource")

插件将根据graphql文件生成Java bean,可使用这些Java bean进行业务逻辑编写和GPA接口定义.
```
|-- order-package                             订单包 
    |-- build.gradle
    |-- src
        |-- main
            |-- java
                |-- demo.gp.order
                    |-- dto
                        |-- annotation        GPA注解
                        |-- directive         指令注解
                        |-- inputObjectType   Input实体
                        |-- objectType        Object实体
```

### 配置启动器
1. 引入依赖
```gradle title="order-app/build.gradle"
repositories {
    mavenCentral()
    jcenter() //Graphoenix的反编译器jd-core发布在jcenter,未来反编译器将替换为IDEA使用的fernflower,之后不再依赖
}

dependencies {
    implementation 'io.graphoenix:graphoenix-core:0.0.1-SNAPSHOT' //核心
    implementation 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'  //依赖注入
    implementation 'io.nozdormu:nozdormu-config:0.0.1-SNAPSHOT'  //配置
    implementation 'io.graphoenix:graphoenix-http-server:0.0.1-SNAPSHOT' //http服务器
    implementation 'io.graphoenix:graphoenix-r2dbc:0.0.1-SNAPSHOT' //r2dbc数据库连接
    implementation 'io.graphoenix:graphoenix-introspection:0.0.1-SNAPSHOT' //内省
    implementation 'io.graphoenix:graphoenix-admin:0.0.1-SNAPSHOT' //开发者工具,提供GraphiQL和GraphQL Voyager

    implementation 'org.mariadb:r2dbc-mariadb:1.1.4' //mariadb驱动
    //implementation group: 'io.netty', name: 'netty-resolver-dns-native-macos', version: '4.1.81.Final', classifier: 'osx-aarch_64' //如果使用苹果m1芯片需要引用

    annotationProcessor 'io.graphoenix:graphoenix-annotation-processor:0.0.1-SNAPSHOT' //核心编译器
    //implementation依赖全部加入到annotationProcessor
    annotationProcessor 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'
    annotationProcessor 'io.nozdormu:nozdormu-config:0.0.1-SNAPSHOT'
    annotationProcessor 'io.graphoenix:graphoenix-http-server:0.0.1-SNAPSHOT'
    annotationProcessor 'io.graphoenix:graphoenix-r2dbc:0.0.1-SNAPSHOT'
    annotationProcessor 'io.graphoenix:graphoenix-introspection:0.0.1-SNAPSHOT'
    annotationProcessor 'org.mariadb:r2dbc-mariadb:1.1.4'
}
```

2. 创建启动类
```java title="order-app/src/main/java/demo/gp/order/App.java"
package demo.gp.order;

import io.graphoenix.spi.annotation.Application;

import static io.graphoenix.core.bootstrap.App.APP;

@Application    // 添加@Application注解标记为启动类
public class App {

    public static void main(String[] args) {
        APP.run(args);
    }
}
```

3. 配置服务与数据库
```hocon title="order-app/src/main/resources/graphql/application.conf"
graphql {
  buildIntrospection = true                           //生成内省文档
}
package {
  packageName = "demo.gp.order"                       //与包名相同
  localPackageNames = ["io.graphoenix.introspection"] //本地包配置,此处引入内省包
}
r2dbc {
  driver = "mariadb"  //此处使用mariadb驱动
  database = "order"  //数据库
  user = "root"       //数据库用户
  password = "root"   //数据库密码
}
```

## 启动
Start or Debug App.main

GraphQL endpoint: http://localhost:8080/graphql

GraphiQL endpoint: http://localhost:8906