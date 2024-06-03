---
sidebar_position: 5
---

# GPI(GraphQL API)

定义 GraphQL 编程接口

GraphQL Api 基于[Microprofile GraphQL 协议](https://github.com/eclipse/microprofile-graphql)实现

新建 SystemApi.java 来构建 api 示例

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

## 查询接口

### 1. 定义一个简单接口, 传入 userName, 返回欢迎和系统时间

定义 hello 接口, 使用@Query 注解标记接口方法

```java
package demo.gp.order.api;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

import java.time.LocalDateTime;

// highlight-start
@GraphQLApi // 使用@GraphQLApi 注解标记接口所在 CDI Bean
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

### 2. 定义一个异步接口, 传入 userName, 异步返回欢迎和系统时间

```java
@GraphQLApi
@ApplicationScoped
public class SystemApi {

    // ...省略其他接口

// highlight-start
    @Query
    public Mono<String> helloAsync(String userName) {
        return Mono.just(LocalDateTime.now())
                .map(now -> "Hello " + userName + ", The time is now " + now);
    }
// highlight-end
}
```

查询 helloAsync 接口

```graphql
{
  helloAsync(userName: "Gosling")
}
```

```json
{
  "data": {
    "helloAsync": "Hello Gosling, The time is now 2024-05-31T16:18:39.851451"
  }
}
```

## 变更接口

### 1. 模拟一个用户注册接口

本次我们使用对象结构来定义接口输入参数和返回结果, 首先使用@Input 注解定义输入对象

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
    registerInput: {
      name: "Gosling"
      email: "gosling@java.com"
      birthday: "1955-05-19"
    }
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

### 2. 定义一个异步变更接口, 返回 Flux

```java
@GraphQLApi
@ApplicationScoped
public class SystemApi {

    // ...省略其他接口

// highlight-start
    @Mutation
    public Flux<String> countingSheep(int count) {
        return Flux.range(0, count)
                .map(index -> index + 1 + " sheep");
    }
// highlight-end
}
```

查询 countingSheep 接口

```graphql
mutation {
  countingSheep(count: 3)
}
```

Flux 的元素会聚合成数组后返回

```json
{
  "data": {
    "countingSheep": ["1 sheep", "2 sheep", "3 sheep"]
  }
}
```

## 字段接口

在有些场景下, 需要在数据库返回后对结果进行加工, 并产生新的字段, 如数学计算和调用规则引擎等

### 1. 计算每一个订单的价格合计

使用@Source注解在接口参数中标记带有@Type注解的Bean

```java
@GraphQLApi
@ApplicationScoped
public class SystemApi {

    // ...省略其他接口

// highlight-start
    public Float total(@Source Order order) {
        if (order.getItems() != null) {
            return order.getItems().stream()
                    .filter(orderItem -> orderItem.getProduct() != null && orderItem.getProduct().getPrice() != null)
                    .map(orderItem -> orderItem.getProduct().getPrice() * orderItem.getQuantity())
                    .reduce(Float::sum)
                    .orElse(null);
        }
        return null;
    }
// highlight-end
}
```

此时Order对象会生成一个新的名为total的字段

```graphql
type Order implements Meta {
  "订单ID"
  id: ID!
  "购买用户"
  user: User!
  "产品列表"
  items: [OrderItem!]!
  // highlight-start
  total: Float
  // highlight-end
}
```

查询用户Diana的订单

```graphql
{
  user(name: {opr: EQ, val: "Diana"}) {
    name
    orders {
      items {
        product {
          name
          price
        }
        quantity
      }
      // highlight-start
      total
      // highlight-end
    }
  }
}
```

订单会在api接口中计算后返回结果

```json
{
  "data": {
    "user": {
      "name": "Diana",
      "orders": [
        {
          "items": [
            {
              "product": {
                "name": "Laptop",
                "price": 999.99
              },
              "quantity": 1
            },
            {
              "product": {
                "name": "Phone",
                "price": 499.99
              },
              "quantity": 1
            },
            {
              "product": {
                "name": "Tablet",
                "price": 299.99
              },
              "quantity": 1
            }
          ],
          // highlight-start
          "total": 1799.97
          // highlight-end
        }
      ]
    }
  }
}
```

## 参数接口

在有些场景下, 需要在数据库查询和变更前对查询条件或提交内容进行加工, 如校验, 鉴权或修改等

### 1. 在后台增加条件, 隐藏用户Mike

使用@Source注解在接口参数中标记带有@Input注解的Bean, 接口的返回值将会覆盖原始参数

```java
@GraphQLApi
@ApplicationScoped
public class SystemApi {

    // ...省略其他接口

// highlight-start
    public UserListQueryArguments hideMike(@Source UserListQueryArguments userListQueryArguments) {
        if (userListQueryArguments == null) {
            userListQueryArguments = new UserListQueryArguments();
        }
        StringExpression stringExpression = new StringExpression();
        stringExpression.setOpr(Operator.NEQ);
        stringExpression.setVal("Mike");
        userListQueryArguments.setName(stringExpression);
        return userListQueryArguments;
    }
// highlight-end
}
```

查询用户列表

```graphql
{
  userList {
    name
  }
}
```

用户列表中没有Mike

```json
{
  "data": {
    "userList": [
      {
        "name": "Alice"
      },
      {
        "name": "Bob"
      },
      {
        "name": "Charlie"
      },
      {
        "name": "Diana"
      },
      {
        "name": "Edward"
      },
      {
        "name": "Fiona"
      },
      {
        "name": "George"
      },
      {
        "name": "Hannah"
      },
      {
        "name": "Ian"
      },
      {
        "name": "Jane"
      },
      {
        "name": "Kyle"
      },
      {
        "name": "Laura"
      },
      {
        "name": "Nina"
      },
      {
        "name": "Oliver"
      },
      {
        "name": "Paula"
      },
      {
        "name": "Quentin"
      },
      {
        "name": "Rachel"
      },
      {
        "name": "Steve"
      },
      {
        "name": "Tina"
      }
    ]
  }
}
```
