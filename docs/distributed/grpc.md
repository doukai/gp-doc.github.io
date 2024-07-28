---
sidebar_position: 2
---

# gRPC

gRPC是一种高性能, 开源的远程过程调用（RPC）框架, 最初由Google开发. 它使用HTTP/2作为传输协议, 并采用Protocol Buffers（protobuf）作为接口描述语言和数据序列化格式. gRPC支持多种编程语言, 可以实现跨语言的服务调用. 其特点包括双向流, 负载均衡, 认证和超时控制等, 适用于微服务架构下的高效通信

## 安装

### protobuf 插件

引用插件生成 protobuf 文件

<details>
<summary>user-package</summary>

```gradle title="build.gradle"
buildscript {
    repositories {
        mavenLocal()
        jcenter()
        gradlePluginPortal()
    }
    dependencies {
        // highlight-start
        classpath 'io.graphoenix:graphoenix-gradle-plugin:0.0.1-SNAPSHOT'
        // highlight-end
    }
}

plugins {
    id 'java'
    // highlight-start
    id 'com.google.protobuf' version '0.9.1'
    // highlight-end
}
apply plugin: 'io.graphoenix'
classes.dependsOn {
    generateGraphQLSource
    // highlight-start
    generateProtobufV3
    // highlight-end
}
```

生成 dto 和 protobuf

```bash
./gradlew :user-package:build
```

</details>

<details>
<summary>review-package</summary>

```gradle title="build.gradle"
buildscript {
    repositories {
        mavenLocal()
        jcenter()
        gradlePluginPortal()
    }
    dependencies {
        // highlight-start
        classpath 'io.graphoenix:graphoenix-gradle-plugin:0.0.1-SNAPSHOT'
        // highlight-end
    }
}

plugins {
    id 'java'
    // highlight-start
    id 'com.google.protobuf' version '0.9.1'
    // highlight-end
}
apply plugin: 'io.graphoenix'
classes.dependsOn {
    generateGraphQLSource
    // highlight-start
    generateProtobufV3
    // highlight-end
}
```

生成 dto 和 protobuf

```bash
./gradlew :review-package:build
```

</details>