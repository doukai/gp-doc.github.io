---
sidebar_position: 5
---

# GPI(GraphQL Api)

定义 GraphQL 编程接口.

GraphQL Api 基于[Microprofile GraphQL 协议](https://github.com/eclipse/microprofile-graphql)实现

使用@GraphQLApi 注解标记 CDI Bean

## 查询接口

### 1. 定义一个简单接口, 传入 userName, 返回欢迎和系统时间

```txt
|-- order-package                             订单包
    |-- build.gradle
    |-- src
        |-- main
            |-- java
                |-- demo.gp.order
                    // highlight-start
                    |-- api
                        |-- SystemApi.java    系统API
                    // highlight-end
                    |-- dto
                        |-- annotation        GPA注解
                        |-- directive         指令注解
                        |-- enumType          枚举类型
                        |-- inputObjectType   Input类型
                        |-- objectType        Object类型
```

定义 hello 接口, 使用@Query 注解标记接口方法

```java
package demo.gp.order.api;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

import java.time.LocalDateTime;

// highlight-start
@GraphQLApi
// highlight-end
@ApplicationScoped
public class SystemApi {

// highlight-start
    @Query
    public String hello(String userName) {
        return "Hello " + userName + ", The time is now " + LocalDateTime.now();
    }
// highlight-end
}
```

查询 hello 接口

```graphql
{
  hello(userName: "Gosling")
}
```

```json
{
  "data": {
    "hello": "Hello Gosling, The time is now 2024-05-30T11:51:41.164692"
  }
}
```

## 变更接口

### 1. 模拟一个用户注册接口

使用@Input 注解定义输入对象

```java
package demo.gp.order.api;

import org.eclipse.microprofile.graphql.Input;

import java.time.LocalDate;

@Input
public class RegisterInput {

    @Description("姓名")
    private String name;

    @Description("邮箱")
    private String email;

    @Description("生日")
    private LocalDate birthday;

    // ...省略getter和setter
}
```

使用@Type 注解定义输出对象

```java
package demo.gp.order.api;

import org.eclipse.microprofile.graphql.Type;

@Type
public class RegisterResult {

    @Description("账号")
    private String account;

    @Description("密码")
    private String password;

    @Description("年龄")
    private Integer age;

    // ...省略getter和setter
}

```

定义 register 接口, 使用@Mutation 注解标记接口方法

```java
@GraphQLApi
@ApplicationScoped
public class SystemApi {

    // ...省略其他方法

    @Mutation
    public RegisterResult register(RegisterInput registerInput) {
        String account = registerInput.getEmail().substring(0, registerInput.getEmail().indexOf("@"));
        Integer age = Period.between(registerInput.getBirthday(), LocalDate.now()).getYears();

        RegisterResult registerResult = new RegisterResult();
        registerResult.setAccount(account);
        registerResult.setPassword(genPassword());
        registerResult.setAge(age);

        return registerResult;
    }

    private String genPassword() {
        int leftLimit = 97; // letter 'a'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 10;
        Random random = new Random();

        return random.ints(leftLimit, rightLimit + 1)
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }
}
```

调用 register 接口

```graphql
mutation {
  register(
    registerInput: {name: "Gosling", email: "gosling@java.com", birthday: "1955-05-19"}
  ) {
    account
    password
    age
  }
}
```

```json
{
  "data": {
    "register": {
      "account": "gosling",
      "password": "vuvvtrachs",
      "age": 69
    }
  }
}
```
