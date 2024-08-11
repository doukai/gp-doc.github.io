---
sidebar_position: 1
---

# 安装

安装依赖, 初始化项目

项目结构:

```
|-- order
    |-- build.gradle
    |-- gradle.properties
    |-- settings.gradle
    |-- order-app                             启动器, 引入订单和其他包
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
    |-- other-package                         可根据需求可以加入其他包
        |-- build.gradle
        |-- src
            |-- main
                |-- java
                |   |-- demo.gp.other
                |       |-- package-info.java
                |-- resources
                    |-- graphql
                        |-- other.gql         定义其他相关类型
```

## 配置模块(Package)

### 1. 引入依赖与 Gradle 插件

```gradle title="order-package/build.gradle"
buildscript {
    repositories {
        // highlight-start
        jcenter()
        // highlight-end
    }
}

plugins {
    id 'java-library'
    // highlight-start
    id "org.graphoenix" version "0.1.1"
    // highlight-end
}

// highlight-start
classes.dependsOn {
    generateGraphQLSource
}
// highlight-end

repositories {
    mavenCentral()
    // highlight-start
    jcenter()
    // highlight-end
}

dependencies {
    // highlight-start
    implementation 'org.graphoenix:graphoenix-core:0.1.0'                       // 核心
    implementation 'org.graphoenix:nozdormu-inject:0.1.0'                       // 依赖注入
    implementation 'org.graphoenix:nozdormu-config:0.1.0'                       // 配置

    annotationProcessor 'org.graphoenix:graphoenix-annotation-processor:0.1.0'  // 核心编译器
    // implementation依赖全部加入到annotationProcessor
    annotationProcessor 'org.graphoenix:nozdormu-inject:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-config:0.1.0'
    // highlight-end
}
```

### 2. 定义包名

```java title="order-package/src/main/java/demo/gp/order/package-info.java"
// highlight-start
@Package    // 添加@Package注解, package-info.java所在路径为包名
// highlight-end
package demo.gp.order;

import io.graphoenix.spi.annotation.Package;
```

## 配置应用(Application)

### 1. 引入依赖

```gradle title="order-app/build.gradle"
repositories {
    mavenCentral()
    // highlight-start
    jcenter()
    // highlight-end
}

dependencies {
    // highlight-start
    implementation 'org.graphoenix:graphoenix-core:0.1.0'                        // 核心
    implementation 'org.graphoenix:nozdormu-inject:0.1.0'                        // 依赖注入
    implementation 'org.graphoenix:nozdormu-config:0.1.0'                        // 配置
    implementation 'org.graphoenix:graphoenix-http-server:0.1.1'                 // http服务器
    implementation 'org.graphoenix:graphoenix-r2dbc:0.1.0'                       // r2dbc数据库连接
    implementation 'org.graphoenix:graphoenix-introspection:0.1.0'               // 内省
    implementation 'org.graphoenix:graphoenix-admin:0.1.1'                       // 开发者工具, 提供GraphiQL和GraphQL Voyager

    runtimeOnly 'org.mariadb:r2dbc-mariadb:1.1.4'                                // mariadb驱动
//  implementation group: 'io.netty', name: 'netty-resolver-dns-native-macos', version: '4.1.81.Final', classifier: 'osx-aarch_64' // OSX需要引用

    annotationProcessor 'org.graphoenix:graphoenix-annotation-processor:0.1.0'   // 核心编译器
    annotationProcessor 'org.graphoenix:nozdormu-inject:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-config:0.1.0'
    annotationProcessor 'org.graphoenix:graphoenix-r2dbc:0.1.0'
    annotationProcessor 'org.graphoenix:graphoenix-introspection:0.1.0'
    // highlight-end
}
```

### 2. 创建启动类

```java title="order-app/src/main/java/demo/gp/order/App.java"
package demo.gp.order;

import io.graphoenix.spi.annotation.Application;

import static io.graphoenix.core.bootstrap.App.APP;

// highlight-start
@Application    // 添加@Application注解标记为启动类, 所在路径为包名
// highlight-end
public class App {

    public static void main(String[] args) {
        APP.run(args);
    }
}
```
