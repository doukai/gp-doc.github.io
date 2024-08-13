---
sidebar_position: 2
---

# gRPC

[gRPC](https://grpc.io/) 是一种高性能, 开源的远程过程调用（RPC）框架, 最初由 Google 开发. 它使用 HTTP/2 作为传输协议, 并采用 [Protocol Buffers](https://protobuf.dev/)（protobuf）作为接口描述语言和数据序列化格式. [gRPC](https://grpc.io/) 支持多种编程语言, 可以实现跨语言的服务调用. 其特点包括双向流, 负载均衡, 认证和超时控制等, 适用于微服务架构下的高效通信

```mermaid
flowchart LR
    subgraph "客户端(client)"
        config[配置gRPC地址]
        invoke[调用Stub接口]
    end
    subgraph "服务端(server)"
        server[gRPC服务]
        impl[Stub接口实现]
    end
    subgraph "模块(package)"
        protobuf[protobuf]
        stub[Stub接口]
    end
    config --引用--> invoke
    invoke <--通讯--> server
    impl --实现--> stub
    invoke <--调用--> stub
    protobuf --生成--> stub
```

## 模块(package)

安装 protobuf 插件, 模块会生成 gRPC 的 protobuf 定义和对应的 Stub 接口供[客户端(client)](#客户端client)使用

### 安装 protobuf 插件和 gRPC 依赖

```gradle title="user-package/build.gradle"
buildscript {
    repositories {
        jcenter()
    }
}

plugins {
    id 'java'
    id "org.graphoenix" version "0.1.1"
    // highlight-start
    id 'com.google.protobuf' version '0.9.1'
    // highlight-end
}

classes {
    dependsOn generateGraphQLSource
    // highlight-start
    dependsOn generateProtobufV3
    // highlight-end
}

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
    implementation 'org.graphoenix:graphoenix-core:0.1.0'
    implementation 'org.graphoenix:nozdormu-inject:0.1.0'
    implementation 'org.graphoenix:nozdormu-async:0.1.0'
    implementation 'org.graphoenix:nozdormu-interceptor:0.1.0'
    implementation 'org.graphoenix:nozdormu-config:0.1.0'

    // highlight-start
    // gRPC 依赖
    runtimeOnly 'io.grpc:grpc-netty-shaded:1.52.1'
    implementation 'io.grpc:grpc-protobuf:1.52.1'
    implementation 'io.grpc:grpc-stub:1.52.1'
    implementation 'com.salesforce.servicelibs:reactor-grpc-stub:1.2.3'

    compileOnly 'org.apache.tomcat:annotations-api:6.0.53' // necessary for Java 9+
    // highlight-end

    annotationProcessor 'org.graphoenix:graphoenix-annotation-processor:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-inject:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-async:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-interceptor:0.1.0'
    annotationProcessor 'org.graphoenix:nozdormu-config:0.1.0'

    protobuf 'org.graphoenix:graphoenix-core:0.1.0'

    testImplementation platform('org.junit:junit-bom:5.9.1')
    testImplementation 'org.junit.jupiter:junit-jupiter'
}
```

### 生成 DTO 和 protobuf

```bash
./gradlew :user-package:build
```

<details>
<summary>protobuf目录</summary>

```txt
|-- order-microservices
    |-- user-package                                用户模块
        |-- build.gradle
        |-- src
            |-- main
                |-- java
                |   |-- demo.gp.user
                |       |-- package-info.java
                // highlight-start
                |-- proto
                |   |-- demo.gp.user
                |       |-- enums.proto             枚举类型
                |       |-- input_objects.proto     输入类型
                |       |-- interfaces.proto        接口类型
                |       |-- objects.proto           对象类型
                |       |-- query.proto             查询服务
                |       |-- mutation.proto          变更服务
                // highlight-end
                |-- resources
                    |-- graphql
                        |-- user.gql                定义用户相关类型
```

</details>

Graphoenix 根据 GraphQL 生成对应的 protobuf 定义文件

```mermaid
flowchart LR
    uml[后端建模]
    grpc((gRPC服务))
    subgraph Graphoenix
        schema["// types.graphql
            type User {
            &emsp;id: ID
            &emsp;name: String!
            &emsp;userType: UserType!
            }"] -- 转译 --> protobuf["// types.proto
            message Product {
            &emsp;string id = 1;
            &emsp;optional string name = 2;
            &emsp;optional UserType userType = 3
            }"] -- 构建 --> service["// service.proto
            service QueryService {
            &emsp;rpc User (Request) returns (Response);
            &emsp;rpc UserList (Request) returns (Response);
            &emsp;rpc UserConnection (Request) returns (Response);
            }"]
        style schema text-align:left
        style protobuf text-align:left
        style service text-align:left
    end
    uml --> schema
    service --> grpc
```

---

## 服务端(server)

### 安装 graphoenix-grpc-server 模块

安装 graphoenix-grpc-server 模块, Graphoenix 将根据[模块(package)](#模块package)中的定义自动实现 gRPC 服务接口

```gradle title="user-app/build.gradle"
dependencies {
    implementation 'org.graphoenix:graphoenix-core:0.1.0'
    implementation 'org.graphoenix:graphoenix-r2dbc:0.1.0'
    // highlight-start
    // gRPC 服务
    implementation 'org.graphoenix:graphoenix-grpc-server:0.1.1'
    // highlight-end

    implementation 'org.graphoenix:nozdormu-inject:0.1.0'
    implementation 'org.graphoenix:nozdormu-config:0.1.0'

    runtimeOnly 'org.mariadb:r2dbc-mariadb:1.1.4'

    annotationProcessor 'org.graphoenix:graphoenix-annotation-processor:0.1.0'
    annotationProcessor 'org.graphoenix:graphoenix-sql:0.1.0'
    // highlight-start
    // gRPC 服务
    annotationProcessor 'org.graphoenix:graphoenix-grpc-server:0.1.1'
    // highlight-end
}
```

### 启动 gRPC 服务

Run/Debug user-app/src/main/java/demo/gp/user/App.java

---

## 客户端(client)

引用需要调用的 [gRPC 模块(package)](#模块package)

```gradle title="order-package/build.gradle"
dependencies {
    // highlight-start
    implementation project(':user-package')
    // highlight-end
    // ...
}
```

### 查询

使用 `QueryServiceGrpc.QueryServiceBlockingStub` 接口中与 Query 对象中同名的方法查询, 使用 `setSelectionSet` 方法来设置查询字段

```java
import demo.gp.user.dto.enumType.grpc.UserType;
import demo.gp.user.grpc.*;
import io.graphoenix.core.dto.enumType.grpc.Operator;
import io.graphoenix.core.dto.inputObjectType.grpc.StringExpression;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class UserGrpcTest {

    // highlight-start
    // gRPC server 地址
    private static final String userGrpcAddress = "localhost:50053";
    private static final ManagedChannel userManagedChannel = ManagedChannelBuilder.forTarget(userGrpcAddress).usePlaintext().build();
    private static final QueryServiceGrpc.QueryServiceBlockingStub queryServiceStub = QueryServiceGrpc.newBlockingStub(userManagedChannel);
    // highlight-end

    @Test
    void queryUserTest() {
        // highlight-start
        QueryUserRequest queryUserRequest = QueryUserRequest.newBuilder()
                .setSelectionSet("{name userType}")
                .setName(
                        StringExpression.newBuilder()
                                .setOpr(Operator.EQ_OPERATOR)
                                .setVal("Alice")
                                .build()
                )
                .build();
        QueryUserResponse response = queryServiceStub.user(queryUserRequest);
        // highlight-end

        assertAll(
                () -> assertEquals(response.getUser().getName(), "Alice"),
                () -> assertEquals(response.getUser().getUserType(), UserType.VIP_USER_TYPE),
                () -> assertEquals(response.getUser().getEmail(), "")
        );
    }
}
```

方法等同于如下 GraphQL 查询

```graphql
query {
  user(name: { opr: EQ, val: "Alice" }) {
    name
    userType
  }
}
```

### 变更

使用 `MutationServiceGrpc.MutationServiceBlockingStub` 接口中与 Mutation 对象中同名的方法变更, 使用 `setSelectionSet` 方法来设置查询字段

```java
import demo.gp.user.dto.enumType.grpc.UserType;
import demo.gp.user.grpc.*;
import io.graphoenix.core.dto.enumType.grpc.Operator;
import io.graphoenix.core.dto.inputObjectType.grpc.StringExpression;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class UserGrpcTest {

    // highlight-start
    // gRPC server 地址
    private static final String userGrpcAddress = "localhost:50053";
    private static final ManagedChannel userManagedChannel = ManagedChannelBuilder.forTarget(userGrpcAddress).usePlaintext().build();
    private static final MutationServiceGrpc.MutationServiceBlockingStub mutationServiceBlockingStub = MutationServiceGrpc.newBlockingStub(userManagedChannel);
    // highlight-end

    @Test
    void MutationUserTest() {
        // highlight-start
        MutationUserRequest mutationUserRequest = MutationUserRequest.newBuilder()
                .setName("Uma")
                .setEmail("uma@example.com")
                .setUserType(UserType.VIP_USER_TYPE)
                .build();
        MutationUserResponse response = mutationServiceBlockingStub.user(mutationUserRequest);
        // highlight-end

        assertAll(
                () -> assertEquals(response.getUser().getName(), "Uma"),
                () -> assertEquals(response.getUser().getEmail(), "uma@example.com"),
                () -> assertEquals(response.getUser().getUserType(), UserType.VIP_USER_TYPE)
        );
    }
}
```

方法等同于如下 GraphQL 变更

```graphql
mutaion {
  user(name: "Uma", email: "uma@example.com", userType: VIP) {
    id
    name
    email
    userType
  }
}
```

### 响应式

Graphoenix 支持 [Reactive gRPC](https://github.com/salesforce/reactive-grpc), 响应式 Stub 以 Reactor 开头命名

```java
import demo.gp.user.dto.enumType.grpc.UserType;
import demo.gp.user.grpc.*;
import io.graphoenix.core.dto.enumType.grpc.Operator;
import io.graphoenix.core.dto.inputObjectType.grpc.StringExpression;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.*;

public class UserGrpcTest {

    // highlight-start
    // gRPC server 地址
    private static final String userGrpcAddress = "localhost:50053";
    private static final ManagedChannel userManagedChannel = ManagedChannelBuilder.forTarget(userGrpcAddress).usePlaintext().build();
    // 响应式 Stub
    private static final ReactorQueryServiceGrpc.ReactorQueryServiceStub reactorQueryServiceStub = ReactorQueryServiceGrpc.newReactorStub(userManagedChannel);
    // highlight-end

    @Test
    void reactorQueryUserTest() {
        // highlight-start
        QueryUserRequest queryUserRequest = QueryUserRequest.newBuilder()
                .setName(
                        StringExpression.newBuilder()
                                .setOpr(Operator.EQ_OPERATOR)
                                .setVal("Bob")
                                .build()
                )
                .build();
        Mono<QueryUserResponse> responseMono = reactorQueryServiceStub.user(queryUserRequest);
        // highlight-end

        StepVerifier.create(responseMono)
                .assertNext(response ->
                        assertAll(
                                () -> assertEquals(response.getUser().getName(), "Bob"),
                                () -> assertEquals(response.getUser().getEmail(), "bob@example.com"),
                                () -> assertEquals(response.getUser().getUserType(), UserType.REGULAR_USER_TYPE)
                        )
                )
                .expectComplete()
                .verify();
    }
}
```

### 负载均衡

Graphoenix 提供 `PackageNameResolverProvider` 支持 gRPC 负载均衡, 使用 `package://package.name` 作为模块地址, 提供 `pick_first` 和 `round_robin` 两种策略

```java
import io.grpc.ManagedChannel;
import io.grpc.NameResolverRegistry;
import io.graphoenix.grpc.client.resolver.PackageNameResolverProvider;

public class UserGrpcTest {

    // private static final String userGrpcAddress = "localhost:50053";
    // private static final ManagedChannel userManagedChannel = ManagedChannelBuilder.forTarget(userGrpcAddress).usePlaintext().build();
    // highlight-start
    // gRPC server 地址
    private static final String userGrpcAddress = "package://demo.gp.user";
    private static final ManagedChannel userManagedChannel = ManagedChannelBuilder.forTarget(userGrpcAddress).defaultLoadBalancingPolicy("round_robin").usePlaintext().build()
    // highlight-end
    private static final QueryServiceGrpc.QueryServiceBlockingStub queryServiceStub = QueryServiceGrpc.newBlockingStub(userManagedChannel);

    @Inject
    public UserGrpcTest(PackageNameResolverProvider packageNameResolverProvider) {
        // highlight-start
        // 注册地址工厂
        NameResolverRegistry.getDefaultRegistry().register(packageNameResolverProvider);
        // highlight-end
    }
}
```

## _本节示例_

https://github.com/doukai/order-microservices/tree/main/order-app/src/test/java/demo/gp/order/test/grpc
