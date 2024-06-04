---
sidebar_position: 6
---

# GPA(GraphQL Persistence API)

定义 GraphQL 持久化接口.

GraphQL Persistence API 类似于 JPA(Java Persistence API), 比 JPA 更简洁直观

新建 UserRepository.java 来构建 persistence api 示例

```txt
|-- order-package                             订单包
    |-- build.gradle
    |-- src
        |-- main
        |   |-- java
        |       |-- demo.gp.order
        |           |-- api
        |               |-- SystemApi.java    系统API
        |           |-- dto
        |           |   |-- annotation        GPA注解
        |           |   |-- directive         指令注解
        |           |   |-- enumType          枚举类型
        |           |   |-- inputObjectType   Input类型
        |           |   |-- objectType        Object类型
                    // highlight-start
        |           |-- repository
        |               |-- UserRepository.java             用户Repository
        |               |-- ProductRepository.java          产品Repository
                    // highlight-end
        |-- main
            |-- java
                |-- demo.gp.order
                    // highlight-start
                    |-- test
                        |-- TestResultLoggerExtension.java  测试结果日志拓展
                        |-- UserRepositoryTest.java         用户Repository测试类
                        |-- ProductRepositoryTest.java      产品Repository测试类
                    // highlight-end
```

## 查询接口

### 1. 查询所有 VIP 用户

定义 queryVIPUserList 方法, 使用@Query 注解标记接口方法, 请注意, 此处的@Query 注解是在之前生成的的[GPA 注解](/docs/tutorial/quick-start#4-使用-gradle-插件生成-java-bean), **并非 org.eclipse.microprofile.graphql.Query**

@Query 注解中包含所有的 GraphQL 查询字段, 参数和字段参数相同

```java
package demo.gp.order.repository;

// highlight-start
import demo.gp.order.dto.annotation.Query;
// highlight-end
import demo.gp.order.dto.annotation.UserListQueryArguments;
import demo.gp.order.dto.annotation.UserTypeExpression1;
import demo.gp.order.dto.enumType.UserType;
import demo.gp.order.dto.objectType.User;
import io.graphoenix.core.dto.enumType.Operator;
import io.graphoenix.spi.annotation.GraphQLOperation;

import java.util.List;

// highlight-start
@GraphQLOperation // 使用@GraphQLOperation 注解标记接口所在 CDI Bean
// highlight-end
public interface UserRepository {

    // highlight-start
    // 查询所有用户类型=VIP的User
    @Query(userList = @UserListQueryArguments(userType = @UserTypeExpression1(opr = Operator.EQ, val = UserType.VIP)))
    // highlight-end
    Mono<List<User>> queryVIPUserList();
}
```

测试每一个 User 的 userType

```java
package demo.gp.order.test;

import demo.gp.order.dto.enumType.UserType;
import demo.gp.order.dto.objectType.User;
import demo.gp.order.repository.UserRepository;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(TestResultLoggerExtension.class)
public class UserRepositoryTest {

    private final UserRepository userRepository = BeanContext.get(UserRepository.class);

    @Test
    void queryVIPUserListTest() {
        List<User> userLit = userRepository.queryVIPUserList().block();
        assertAll(
                userLit.stream().map((item) -> () -> assertEquals(item.getUserType(), UserType.VIP))
        );
    }
}
```

输出结果

```log
INFO: Test Successful for test queryVIPUserListTest():
```

### 2. 根据变量查询用户

以 **$** 开头的参数可以指定方法参数名, 作为接口变量

```java
package demo.gp.order.repository;

// highlight-start
import demo.gp.order.dto.annotation.Query;
// highlight-end
import demo.gp.order.dto.annotation.UserListQueryArguments;
import demo.gp.order.dto.annotation.UserTypeExpression1;
import demo.gp.order.dto.enumType.UserType;
import demo.gp.order.dto.objectType.User;
import io.graphoenix.core.dto.enumType.Operator;
import io.graphoenix.spi.annotation.GraphQLOperation;

import java.util.List;

@GraphQLOperation
public interface UserRepository {

    // highlight-start
    // 查询所有用户类型=userType参数的User
    @Query(userList = @UserListQueryArguments(userType = @UserTypeExpression1(opr = Operator.EQ, $val = "userType")))
    // highlight-end
    Mono<List<User>> queryUserListByUserType(UserType userType);
}
```

测试每一个 User 的 userType

```java
@ExtendWith(TestResultLoggerExtension.class)
public class UserRepositoryTest {

    private final UserRepository userRepository = BeanContext.get(UserRepository.class);

    @Test
    void queryUserListByUserTypeTest() {
        List<User> userLit = userRepository.queryUserListByUserType(UserType.REGULAR).block();
        assertAll(
                userLit.stream().map((item) -> () -> assertEquals(item.getUserType(), UserType.REGULAR))
        );
    }
}
```

输出结果

```log
INFO: Test Successful for test queryVIPUserListByUserTypeTest():
```

### 3. 控制查询字段

GPA 接口在默认情况下只会查询所有 Scalar 字段, 可以使用@SelectionSet 注解自定义查询字段

```java
@GraphQLOperation
public interface UserRepository {

    @Query(userList = @UserListQueryArguments(userType = @UserTypeExpression1(opr = Operator.EQ, $val = "userType")))
    // highlight-start
    // 查询name字段
    @SelectionSet("{ name }")
    // highlight-end
    Mono<List<User>> queryUserNameListByUserType(UserType userType);
}
```

测试每一个 User 的 返回字段, 除 name 字段外全部为 null

```java
@ExtendWith(TestResultLoggerExtension.class)
public class UserRepositoryTest {

    private final UserRepository userRepository = BeanContext.get(UserRepository.class);

    @Test
    void queryUserNameListByUserTypeTest() {
        List<User> userLit = userRepository.queryUserNameListByUserType(UserType.REGULAR).block();
        assertAll(
                userLit.stream().map((item) ->
                        () -> assertAll(
                                () -> assertNotNull(item.getName()),
                                () -> assertNull(item.getId()),
                                () -> assertNull(item.getUserType()),
                                () -> assertNull(item.getEmail()),
                                () -> assertNull(item.getPhoneNumbers())
                        )
                )
        );
    }
}
```

输出结果

```log
INFO: Test Successful for test queryUserNameListByUserTypeTest():
```

### 4. 查询 Alice 的订单

使用 name 参数作为用户名查询变量, 查询用户的订单信息

```java
@GraphQLOperation
public interface UserRepository {

    // highlight-start
    @Query(user = @UserQueryArguments(name = @StringExpression1(opr = Operator.EQ, $val = "name")))
    @SelectionSet("{ name orders { items { product { name } quantity } } }")
    // highlight-end
    Mono<User> queryUserOrdersListByName(String name);
}
```

测试每一个 User 的 订单信息

```java
@ExtendWith(TestResultLoggerExtension.class)
public class UserRepositoryTest {

    private final UserRepository userRepository = BeanContext.get(UserRepository.class);

    @Test
    void queryUserOrdersListByNameTest() {
        User user = userRepository.queryUserOrdersListByName("Alice").block();
        assertAll(
                () -> assertEquals(user.getOrders().size(), 1),
                () -> assertEquals(new ArrayList<>(user.getOrders()).get(0).getItems().size(), 2),
                () -> assertEquals(new ArrayList<>(new ArrayList<>(user.getOrders()).get(0).getItems()).get(0).getProduct().getName(), "Laptop"),
                () -> assertEquals(new ArrayList<>(new ArrayList<>(user.getOrders()).get(0).getItems()).get(0).getQuantity(), 1),
                () -> assertEquals(new ArrayList<>(new ArrayList<>(user.getOrders()).get(0).getItems()).get(1).getProduct().getName(), "Tablet"),
                () -> assertEquals(new ArrayList<>(new ArrayList<>(user.getOrders()).get(0).getItems()).get(1).getQuantity(), 2)
        );
    }
}
```

输出结果

```log
INFO: Test Successful for test queryUserOrdersListByNameTest():
```

### 5. 分组查询普通用户和会员用户的数量

```java
@GraphQLOperation
public interface UserRepository {

    // highlight-start
    @Query(userList = @UserListQueryArguments(groupBy = {"userType"}))
    @SelectionSet("{ userType idCount }")
    // highlight-end
    Mono<List<User>> queryUserCountByUserType();
}
```

```java
@ExtendWith(TestResultLoggerExtension.class)
public class UserRepositoryTest {

    private final UserRepository userRepository = BeanContext.get(UserRepository.class);

    @Test
    void queryUserCountByUserTypeTest() {
        List<User> userList = userRepository.queryUserCountByUserType().block();
        assertAll(
                () -> assertEquals(userList.size(), 2),
                () -> assertEquals(new ArrayList<>(userList).get(0).getUserType(), UserType.VIP),
                () -> assertEquals(new ArrayList<>(userList).get(0).getIdCount(), 12),
                () -> assertEquals(new ArrayList<>(userList).get(1).getUserType(), UserType.REGULAR),
                () -> assertEquals(new ArrayList<>(userList).get(1).getIdCount(), 12)
        );
    }
}
```

输出结果

```log
INFO: Test Successful for test queryUserCountByUserTypeTest():
```

### 6. 查询价格在 300 以内, 价格最高的产品

```java
@GraphQLOperation
public interface ProductRepository {

    // highlight-start
    @Query(product = @ProductQueryArguments(price = @FloatExpression1(opr = Operator.LTE, $val = "price")))
    @SelectionSet("{ name priceMax }")
    // highlight-end
    Mono<Product> queryPriceMaxLessThan(Float price);
}
```

```java
@ExtendWith(TestResultLoggerExtension.class)
public class ProductRepositoryTest {

    private final ProductRepository productRepository = BeanContext.get(ProductRepository.class);

    @Test
    void queryPriceMaxLessThanTest() {
        Product product = productRepository.queryPriceMaxLessThan(300.00f).block();
        assertAll(
                () -> assertEquals(product.getName(), "Tablet"),
                () -> assertEquals(product.getPriceMax(), 299.99f)
        );
    }
}
```

输出结果

```log
INFO: Test Successful for test queryPriceMaxLessThanTest():
```

## 变更接口

### 1. 新增用户 Yara

```java
@GraphQLOperation
public interface UserRepository {

    // highlight-start
    @Mutation(user = @UserMutationArguments($input = "userInput"))
    @SelectionSet("{ id name email userType }")
    // highlight-end
    Mono<User> mutationUser(UserInput userInput);
}
```

```java
@ExtendWith(TestResultLoggerExtension.class)
public class UserRepositoryTest {

    private final UserRepository userRepository = BeanContext.get(UserRepository.class);

    @Test
    void mutationUserTest() {
        UserInput userInput = new UserInput();
        userInput.setName("Yara");
        userInput.setEmail("yara@example.com");
        userInput.setUserType(UserType.VIP);
        User user = userRepository.mutationUser(userInput).block();
        assertAll(
                () -> assertNotNull(user.getId()),
                () -> assertEquals(user.getName(), "Yara"),
                () -> assertEquals(user.getEmail(), "yara@example.com"),
                () -> assertEquals(user.getUserType(), UserType.VIP)
        );
    }
}
```

输出结果

```log
INFO: Test Successful for test mutationUserTest():
```
