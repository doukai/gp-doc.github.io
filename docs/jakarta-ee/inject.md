---
sidebar_position: 1
---

# 依赖注入

依赖注入作为实现关系解偶和控制反转的一种设计模式已经成为 Java 开发的核心特性

著名的 [Spring](https://spring.io/) 框架最早就是以实现依赖注入而闻名, 随着时间的推移 Spring 已经发展为一个庞然大物, 它变得无所不能的同时失去最开始的轻量级特性. 以 [Spring Boot](https://spring.io/projects/spring-boot) 为例, 由于依赖关系的复杂性和不同类库的的版本兼容问题, 每一个新版本的升级对于用户而言都已经成为了难于逾越的鸿沟

对反射技术的过度使用是 Spring 的另一个问题, 它使运行时的性能开销越来越大, 同时过多的程序逻辑和依赖关系隐藏在了运行时当中, 使得调试变得十分困难, 也无法使用编译器和 IDE 的错误检查, 更成为了 Java Native 化([GraalVM](https://www.graalvm.org/))的严重阻碍

Graphoenix 遵循 [Jakarta Inject](https://github.com/jakartaee/inject) 和 [Jakarta CDI](https://jakarta.ee/specifications/cdi/4.1/jakarta-cdi-spec-4.1) 规范, 对依赖注入, 切面, 配置等 Java 企业级特性提供轻量级实现: [**Nozdormu**](https://github.com/doukai/nozdormu)

Nozdormu 的设计目标:

1. 保持轻量级: 只实现必要的企业级 Java 特性, 不做过多的拓展, 保持简洁和低依赖
2. 运行时无反射: 把运行时的动态逻辑前移到编译阶段, 通过 Annotation Processing 在编译阶段完成 IOC 和 AOP

虽然十分推荐使用 Nozdormu 作为 Graphoeix 的 CDI, 但这并不是强制的, 任何基于[Jakarta Inject](https://github.com/jakartaee/inject) 和 [Jakarta CDI](https://jakarta.ee/specifications/cdi/4.1/jakarta-cdi-spec-4.1) 规范的实现都可作为选择，以下是其他 Jakarta CDI 实现

1. [Weld](https://weld.cdi-spec.org/)
2. [Quarkus DI](https://quarkus.io/guides/cdi-reference/)
3. [Open Liberty](https://openliberty.io/guides/cdi-intro.html/)
4. [Apache OpenWebBeans](https://openwebbeans.apache.org/)

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
    // highlight-start
    implementation 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'

    annotationProcessor 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'
    // highlight-end
}
```

## 依赖定义

### 注解方式

#### 单例

使用 `@Singleton` 或 `@ApplicationScoped`

```java title="Engine.java"
import jakarta.enterprise.context.ApplicationScoped;

// highlight-start
@ApplicationScoped
// highlight-end
public class Engine {

    public String getName(){
        return "V8 Engine";
    }
}
```

#### 多例

使用 `@Dependent`

```java title="Driver.java"
import jakarta.enterprise.context.Dependent;

import java.util.UUID;

// highlight-start
@Dependent
// highlight-end
public class Driver {

    private final String name;

    public Driver() {
        name = "Mr." + UUID.randomUUID();
    }

    public String getName() {
        return name;
    }
}
```

#### 特定生命周期

1. 请求: `@RequestScoped`
2. 会话: `@SessionScoped`
3. 事务: `@TransactionScoped`

```java title="Broadcast.java"
import jakarta.enterprise.context.RequestScoped;

// highlight-start
@RequestScoped
// highlight-end
public class Broadcast {

    public String getName(){
        return "BBC";
    }
}
```

### 工厂方法(Produces)

在引用第三方类库中的 Bean 时, 无法通过注解方式定义生命周期, 可以使用工厂方法来提供 Bean 实例, 使用 `@Produces` 标记方法, 同时配合其他注解定义生命周期

```java title="Broadcast.java"
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.RequestScoped;
import jakarta.enterprise.inject.Produces;

@ApplicationScoped
public class AutoParts {

    @ApplicationScoped
    // highlight-start
    @Produces
    public Brake brake() {
        return new Brake();
    }
    // highlight-end

    @ApplicationScoped
    // highlight-start
    @Produces
    public Wheel wheel(Brake brake) {
        return new Wheel(brake);
    }
    // highlight-end

    @RequestScoped
    // highlight-start
    @Produces
    public Navigation navigation() {
        return new Navigation();
    }
    // highlight-end
}
```

## 依赖注入(Inject)

### 构造方法注入

推荐使用构造方法进行依赖注入, 在构造方法上使用 `@Inject` 注解

例: 把发动机(单例)添加到汽车中

```java title="Car.java"
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;

@Dependent
public class Car {

    private final Engine engine;

    // highlight-start
    @Inject
    public Car(Engine engine) {
        this.engine = engine;
    }
    // highlight-end

    public Engine getEngine() {
        return engine;
    }
}
```

测试结果

```java title="InjectTest.java"
import io.nozdormu.inject.test.beans.Car;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class InjectTest {

    @Test
    void testCar() {
        Car car1 = BeanContext.get(Car.class);

        assertEquals(car1.getEngine().getName(), "V8 Engine");
    }
}
```

### Setter 方法注入

使用 Setter 方式注入, 在字段或 Setter 方法上使用 `@Inject` 注解

例: 把变速箱(单例)和车主(单例)添加到汽车中

```java title="Car.java"
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;

@Dependent
public class Car {

    private Gearbox gearbox;

    // highlight-start
    @Inject
    private Owner owner;
    // highlight-end

    // highlight-start
    @Inject
    public void setGearbox(Gearbox gearbox) {
        this.gearbox = gearbox;
    }
    // highlight-end

    public void setOwner(Owner owner) {
        this.owner = owner;
    }
}
```

```java title="Gearbox.java"
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class Gearbox {

    public String getName() {
        return "automatic";
    }
}
```

```java title="Owner.java"
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class Owner {

    private final String name;

    public Owner() {
        name = "Mr." + UUID.randomUUID();
    }

    public String getName() {
        return name;
    }
}
```

测试结果

```java title="InjectTest.java"
import io.nozdormu.inject.test.beans.Car;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class InjectTest {

    @Test
    void testCar() {
        Car car1 = BeanContext.get(Car.class);
        Car car2 = BeanContext.get(Car.class);

        assertEquals(car1.getGearbox().getName(), "automatic");
        assertEquals(car1.getOwner().getName(), car2.getOwner().getName());
    }
}
```

### 提供者注入(Provider)

被注入的 Bean 如果是 `@Dependent` (多例)或 `@RequestScoped` (请求范围) 等其他非单例 Bean 时需要使用 Provider 进行包装, 使用时调用 `get()` 方法

例: 把司机(多例)添加到汽车中

```java title="Car.java"
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;

@Dependent
public class Car {

    // highlight-start
    private final Provider<Driver> driver;
    // highlight-end

    @Inject
    public Car(Provider<Driver> driver) {
        this.driver = driver;
    }

    public Driver getDriver() {
        return driver.get();
    }
}
```

测试结果

```java title="InjectTest.java"
import io.nozdormu.inject.test.beans.Car;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class InjectTest {

    @Test
    void testCar() {
        Car car1 = BeanContext.get(Car.class);
        Car car2 = BeanContext.get(Car.class);

        // Driver 不是单例, 每次注入不同的对象
        assertNotEquals(car1.getDriver().getName(), car2.getDriver().getName());
    }
}
```

### 异步提供者注入(Provider\<Mono\>)

**_由于响应式([Reactor](https://projectreactor.io/))运行时没有固定线程, 无法使用传统的 ThreadLocal 等技术对 Bean 进行生命周期的控制, 因此 `@RequestScoped` , `@SessionScoped` 和 `@TransactionScoped` 基于 [Reactor Context](https://spring.io/blog/2023/03/28/context-propagation-with-project-reactor-1-the-basics) 技术实现, 需要以 Mono 形式异步注入_**

例: 把广播节目(请求)添加到汽车中

```java title="Car.java"
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;

@Dependent
public class Car {

    // highlight-start
    @Inject
    private Provider<Mono<Broadcast>> broadcast;
    // highlight-end

    public void setBroadcast(Provider<Mono<Broadcast>> broadcast) {
        this.broadcast = broadcast;
    }

    public Provider<Mono<Broadcast>> getBroadcast() {
        return broadcast;
    }
}
```

测试结果

```java title="InjectTest.java"
import io.nozdormu.inject.test.beans.Car;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.*;

public class InjectTest {

    @Test
    void testCar() {
        Car car1 = BeanContext.get(Car.class);

        StepVerifier.create(car1.getBroadcast().get())
                .assertNext(broadcast -> assertEquals(broadcast.getName(), "BBC"))
                .expectComplete()
                .verify();
    }
}
```

## **注解说明**

### 生命周期

| 注解                                         | 生命周期 | 注入方式                         | 说明                 |
| -------------------------------------------- | -------- | -------------------------------- | -------------------- |
| jakarta.inject.Singleton                     | 单例     | 直接注入                         | 全局共享单个实例     |
| jakarta.enterprise.context.ApplicationScoped | 单例     | 直接注入                         | 全局共享单个实例     |
| jakarta.enterprise.context.Dependent         | 多例     | 提供者注入(Provider)             | 每次注入获得新的实例 |
| jakarta.enterprise.context.RequestScoped     | 请求     | 异步提供者注入(Provider\<Mono\>) | 单个请求内共享实例   |
| jakarta.enterprise.context.SessionScoped     | 会话     | 异步提供者注入(Provider\<Mono\>) | 单个会话内共享实例   |
| jakarta.transaction.TransactionScoped        | 事务     | 异步提供者注入(Provider\<Mono\>) | 单个事务内共享实例   |

### 其他

| 注解                               | 生命周期 | 目标       | 说明                   |
| ---------------------------------- | -------- | ---------- | ---------------------- |
| jakarta.inject.Provider            | 提供者   | 字段       | 提供者                 |
| jakarta.enterprise.inject.Produces | 实例工厂 | 方法或字段 | 表示提供实例的工厂方法 |
