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
                    // highlight-end
        |-- main
            |-- java
                |-- demo.gp.order
                    // highlight-start
                    |-- test
                        |-- TestResultLoggerExtension.java  测试结果日志拓展
                        |-- UserRepositoryTest.java         用户Repository测试类
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
    // 查询所有userType=VIP的User
    @Query(userList = @UserListQueryArguments(userType = @UserTypeExpression1(opr = Operator.EQ, val = UserType.VIP)))
    // highlight-end
    List<User> queryVIPUserList();
}
```

测试每一个 User 的 userType

```java
package demo.gp.order.test;

import demo.gp.order.dto.enumType.UserType;
import demo.gp.order.dto.objectType.User;
import demo.gp.order.repository.UserRepository;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(TestResultLoggerExtension.class)
public class UserRepositoryTest {

    private final UserRepository userRepository = BeanContext.get(UserRepository.class);

    @Test
    void queryVIPUserListTest() {
        List<User> userLit = userRepository.queryVIPUserList().block();
        Assertions.assertAll(
                userLit.stream().map((item) -> () -> assertEquals(item.getUserType(), UserType.VIP))
        );
    }
}
```

输出结果

```log
INFO: Test Successful for test queryVIPUserListTest():
```
