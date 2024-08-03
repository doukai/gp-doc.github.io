---
sidebar_position: 5
---

# 异步和同步(async/await)

响应式编程是一种编程范式, 专注于数据流和变化传播. 通过自动传播数据变化和处理异步操作, 提高系统的响应性和可扩展性. 响应式编程的核心思想是构建系统, 使其能够自动响应输入数据的变化, 并通过非阻塞方式处理异步事件

传统的编程思维通常是命令式的, 同步的. 在这种模式下代码按顺序执行, 程序的状态和流向易于理解和控制. 然而响应式编程是基于数据流和变化传播的异步编程范式, 需要开发者习惯于处理非阻塞和并发的操作

为了降低响应式编程的使用门槛, [**Nozdormu**](https://github.com/doukai/nozdormu) 参考 JavaScript, C# 等现代编程语言, 通过简单的接口和 API 提供 `async` 和 `await` 特性来简化异步代码的编写和维护. 通过代码静态分析, 自动转译同步代码为异步代码, 降低异步编程的心智负担

## 安装

添加依赖

```gradle
repositories {
    mavenCentral()
    // highlight-start
    jcenter()
    // highlight-end
}

dependencies {
    implementation 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'
    // highlight-start
    implementation 'io.nozdormu:nozdormu-async:0.0.1-SNAPSHOT'
    // highlight-end

    annotationProcessor 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'
    // highlight-start
    annotationProcessor 'io.nozdormu:nozdormu-async:0.0.1-SNAPSHOT'
    // highlight-end
}
```

## 定义与调用

通过实现 [`Asyncable`](#asyncable) 接口定义异步类, 异步类中可以使用 [`@Async`](#注解说明) 注解与 [`await`](#asyncable) 方法来同步异步方法, 通过 [`asyncInvoke`](#asyncable) 方法来异步执行方法和获取执行结果

1. 例: 通过用户名自动调用异步方法生成邮箱, 通过 `await(buildEmail(name))` 来同步异步方法, 通过 [`@Async`](#注解说明) 声明方法为异步执行

```java title="UserInfo.java"
import io.nozdormu.spi.async.Async;
import io.nozdormu.spi.async.Asyncable;
import jakarta.enterprise.context.ApplicationScoped;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@ApplicationScoped
// highlight-start
public class UserInfo implements Asyncable {
// highlight-end

    // highlight-start
    public Mono<String> buildEmail(String name) {
        return Mono.just(name + "@nozdormu.com");
    }
    // highlight-end

    public Flux<Integer> buildPassword(String email, int size) {
        return Flux.range(0, size)
                .map(index -> (index + 1) * email.length());
    }

    // highlight-start
    @Async
    // highlight-end
    public User getUser(String name) {
        User user = new User();
        // highlight-start
        String email = await(buildEmail(name));
        // highlight-end
        user.setName(name);
        user.setEmail(email);
        return user;
    }
}
```

测试

```java title="AsyncTest.java"
import io.nozdormu.async.test.beans.User;
import io.nozdormu.async.test.beans.UserInfo;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class AsyncTest {

    @Test
    void testUser() {
        UserInfo userInfo = BeanContext.get(UserInfo.class);
        Mono<User> userMono = userInfo.asyncInvoke("getUser", "nozdormu");
        StepVerifier.create(userMono)
                .assertNext(user -> assertEquals(user.getEmail(), "nozdormu@nozdormu.com"))
                .expectComplete()
                .verify();
    }
}
```

2. 例: 通过模拟用户注册展示多个异步类之间的方法调用, UserService 调用 UserInfo 中的异步方法

```java title="UserService.java"
import io.nozdormu.spi.async.Async;
import io.nozdormu.spi.async.Asyncable;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService implements Asyncable {

    private final UserInfo userInfo;

    @Inject
    public UserService(UserInfo userInfo) {
        this.userInfo = userInfo;
    }

    // highlight-start
    @Async
    // highlight-end
    public User register(String name, int age) {
        // highlight-start
        User user = await(userInfo.getUser(name));
        // highlight-end
        user.setAge(age);
        return user;
    }

    // highlight-start
    @Async
    // highlight-end
    public String genPassword(User user) {
        // highlight-start
        User registedUser = await(userInfo.getUser(user.getName()));
        List<Integer> passwords = await(userInfo.buildPassword(registedUser.getEmail(), registedUser.getName().length()));
        // highlight-end
        return passwords.stream().map(Object::toString).collect(Collectors.joining(""));
    }
}
```

测试

```java title="AsyncTest.java"
import io.nozdormu.async.test.beans.User;
import io.nozdormu.async.test.beans.UserService;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class AsyncTest {

    @Test
    void testUser() {
        UserService userService = BeanContext.get(UserService.class);
        Mono<User> userMono = userService.asyncInvoke("register", "nozdormu", 6);
        StepVerifier.create(userMono)
                .assertNext(user -> assertEquals(user.getEmail(), "nozdormu@nozdormu.com"))
                .expectComplete()
                .verify();

        String name = "kai";
        String email = "kai@nozdormu.com";
        String target = IntStream.range(0, name.length())
                .mapToObj(index -> "" + (index + 1) * email.length())
                .collect(Collectors.joining(""));
        User user = new User();
        user.setName(name);

        Mono<String> genPassword = userService.asyncInvoke("genPassword", user);
        StepVerifier.create(genPassword)
                .assertNext(password -> assertEquals(password, target))
                .expectComplete()
                .verify();
    }
}
```

---

## **异步 API**

### Asyncable

| 方法                                                           | 参数                   | 返回值    | 说明                                     |
| -------------------------------------------------------------- | ---------------------- | --------- | ---------------------------------------- |
| T await(T methodInvoke)                                        | 标记为 `@Async` 的方法 | T         | 同步执行结果                             |
| T await(Mono\<T\> methodInvoke)                                | Mono 类型的异步方法    | T         | 同步执行结果                             |
| List\<T\> await(Flux\<T\> methodInvoke)                        | Flux 类型的异步方法    | List\<T\> | 聚合为集合后同步执行结果                 |
| Mono\<T\> asyncInvoke(String methodName, Object... parameters) | 方法名,方法参数...     | Mono\<T\> | 执行标记为 `@Async` 的方法并异步返回结果 |

## **注解说明**

| 注解                        | 目标 | 说明                                                       |
| --------------------------- | ---- | ---------------------------------------------------------- |
| io.nozdormu.spi.async.Async | 方法 | 标记方法为异步执行, 使用 defaultIfEmpty 字段配置默认返回值 |
