---
sidebar_position: 2
---

# 切面(interceptor)

切面编程（Aspect-Oriented Programming, AOP）是一种编程范式, 它通过将横切关注点（cross-cutting concerns）与业务逻辑分离, 来增强代码的模块化. 在企业级 Java 开发中, AOP 通常用于日志记录, 安全性, 事务管理等方面

主流的 AOP 技术与实现:

| 框架       | 类型                 | 原理                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 缺点                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spring AOP | 运行时               | **JDK 动态代理**: 适用于接口代理. 通过创建实现了目标接口的代理对象来拦截方法调用<br />**CGLIB 代理**: 适用于类代理. 通过创建目标类的子类来拦截方法调用                                                                                                                                                                                                                                                                                                                                                                             | **性能开销**: Spring AOP 基于代理机制, 这意味着每次方法调用都会有额外的代理开销, 可能会影响性能, 尤其是在大量频繁调用的场景下<br />**受限于 Spring 容器**: Spring AOP 仅在 Spring 容器管理的 Bean 上有效, 对于非 Spring 管理的对象无法应用                                                                                                                                                                                                                                                |
| AspectJ    | 编译时/加载时/运行时 | **编译时织入**(Compile-Time Weaving): 在源代码编译为字节码时, 直接将切面代码织入到字节码中. 这需要使用 AspectJ 提供的编译器 ajc, 或者通过将 AspectJ 集成到构建工具(如 Maven 或 Gradle)中<br />**后编译时织入**(Post-Compile Weaving): 也称为二进制织入(Binary Weaving), 是在已经编译好的字节码文件中进行织入. 这种方式适用于需要在编译后的字节码上进行切面增强的场景<br />**加载时织入**(Load-Time Weaving): 在类加载时, 将切面代码动态织入到目标类的字节码中. 这通常需要一个特殊的类加载器, 使用 Java 的 Instrumentation API 实现 | **学习曲线陡峭**: AspectJ 具有强大的功能, 但其语法和概念（如切点表达式, 通知类型, 织入方式等）可能对初学者来说比较复杂, 需要一定的学习成本<br />**编译和构建复杂性**: 使用 AspectJ 编译器(ajc)可能需要额外的构建配置, 尤其是在大型项目中集成 AspectJ 时, 可能会增加构建过程的复杂性<br />**运行时性能开销**: 虽然 AspectJ 的编译时织入性能较好, 但加载时织入可能会带来一定的性能开销<br />**调试困难**: 由于 AspectJ 修改了字节码, 调试切面代码可能会变得困难, 特别是在问题定位和排查方面 |

[**Nozdormu**](https://github.com/doukai/nozdormu) 基于[Jakarta Interceptors](https://jakarta.ee/specifications/interceptors/2.2/jakarta-interceptors-spec-2.2) 规范, 使用透明高效的 Annotation Processing(JSR-269) 技术, 通过对切片代码的静态分析, 在编译前阶段将切面织入到源码中, 易于调试, 充分发挥编译器和 IDE 的检查能力

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
    implementation 'io.nozdormu:nozdormu-interceptor:0.0.1-SNAPSHOT'
    // highlight-end

    annotationProcessor 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'
    // highlight-start
    annotationProcessor 'io.nozdormu:nozdormu-interceptor:0.0.1-SNAPSHOT'
    // highlight-end
}
```

## 方法切面

### 定义方法注解

使用 [`@InterceptorBinding`](#注解说明) 标记方法注解

```java title="Launch.java"
import jakarta.interceptor.InterceptorBinding;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// highlight-start
@InterceptorBinding
// highlight-end
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(value = RetentionPolicy.RUNTIME)
public @interface Launch {
    String value() default "";
}
```

### 实现方法切面

使用 [`@Interceptor`](#注解说明) 和[方法注解](#定义方法注解)标记切面类, 使用 [`@AroundInvoke`](#注解说明)指定切面实现的方法, 如果需要指定切面方法的执行顺序使用 [`@Priority`](#注解说明) 注解指定

使用 [`InvocationContext`](#切面-api) 中的 `proceed()` 方法可以执行[目标方法](#标记目标方法)并返回结果

```java title="FirstLaunchInterceptor.java"
import io.nozdormu.interceptor.test.annotation.Launch;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;

@ApplicationScoped
// highlight-start
@Launch         //方法
@Priority(0)    //顺序注解
@Interceptor    //切面注解
// highlight-end
public class FirstLaunchInterceptor {

    // highlight-start
    @AroundInvoke
    // highlight-end
    public Object aroundInvoke(InvocationContext invocationContext) {
        try {
            // highlight-start
            return "first stage fired -> " + invocationContext.proceed();
            // highlight-end
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

```java title="SecondLaunchInterceptor.java"
import io.nozdormu.interceptor.test.annotation.Launch;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;

@ApplicationScoped
// highlight-start
@Launch         //方法注解
@Priority(1)    //顺序注解
@Interceptor    //切面注解
// highlight-end
public class SecondLaunchInterceptor {

    // highlight-start
    @AroundInvoke
    // highlight-end
    public Object aroundInvoke(InvocationContext invocationContext) {
        try {
            // highlight-start
            return "second stage fired -> " + invocationContext.proceed();
            // highlight-end
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

### 标记目标方法

在目标方法上使用[方法注解](#定义方法注解)

```java title="Satellite.java"
import io.nozdormu.interceptor.test.annotation.Launch;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class Satellite {

    // highlight-start
    @Launch
    // highlight-end
    public String startup(String name) {
        return "hello " + name + " I am " + owner.getName();
    }
}
```

测试

```java title="InterceptorTest.java"
import io.nozdormu.interceptor.test.beans.Satellite;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class InterceptorTest {

    @Test
    void testSatellite() {
        Satellite satellite = BeanContext.get(Satellite.class);
        assertEquals(satellite.checkResult(), "first stage ready -> second stage ready -> all check ready, fire");
    }
}
```

## 构造器切面

### 定义构造器注解

使用 [`@InterceptorBinding`](#注解说明) 标记构造器注解

```java title="Install.java"
import jakarta.interceptor.InterceptorBinding;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// highlight-start
@InterceptorBinding
// highlight-end
@Target({ElementType.TYPE, ElementType.CONSTRUCTOR})
@Retention(value = RetentionPolicy.RUNTIME)
public @interface Install {
}
```

### 实现构造器切面

使用 [`@Interceptor`](#注解说明) 和[构造器注解](#定义构造器注解)标记切面类, 使用 [`@AroundConstruct`](#注解说明) 指定切面实现的方法, 如果需要指定切面方法的执行顺序使用 [`@Priority`](#注解说明) 注解指定

使用 [`InvocationContext`](#切面-api) 中的 `proceed()` 方法可以执行[目标构造器](#标记目标构造器)并返回结果

```java title="FirstInstallInterceptor.java"
import io.nozdormu.interceptor.test.annotation.Install;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.interceptor.AroundConstruct;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
// highlight-start
@Launch         //构造器注解
@Priority(0)    //顺序注解
@Interceptor    //切面注解
// highlight-end
public class FirstInstallInterceptor {

    // highlight-start
    @AroundConstruct
    // highlight-end
    public Object aroundConstruct(InvocationContext invocationContext) {
        List<String> infoList = ((ArrayList<String>) invocationContext.getContextData().computeIfAbsent("infoList", (key) -> new ArrayList<String>()));
        infoList.add("first stage ready ->");
        try {
            // highlight-start
            return invocationContext.proceed();
            // highlight-end
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

```java title="SecondInstallInterceptor.java"
import io.nozdormu.interceptor.test.annotation.Install;
import io.nozdormu.interceptor.test.beans.Satellite;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.interceptor.AroundConstruct;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
// highlight-start
@Launch         //构造器注解
@Priority(1)    //顺序注解
@Interceptor    //切面注解
// highlight-end
public class SecondInstallInterceptor {

    // highlight-start
    @AroundConstruct
    // highlight-end
    public Object aroundConstruct(InvocationContext invocationContext) {
        List<String> infoList = ((ArrayList<String>) invocationContext.getContextData().computeIfAbsent("infoList", (key) -> new ArrayList<String>()));
        infoList.add("second stage ready ->");
        try {
            // highlight-start
            Satellite satellite = (Satellite) invocationContext.proceed();
            // highlight-end
            satellite.setInfoList(infoList);
            return satellite;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

### 标记目标构造器

在目标方法上使用[构造器注解](#定义构造器注解)

```java title="Satellite.java"
import io.nozdormu.interceptor.test.annotation.Install;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class Satellite {

    private List<String> infoList = new ArrayList<>();

    private final Owner owner;

    // highlight-start
    @Install
    // highlight-end
    public Satellite(Owner owner) {
        this.owner = owner;
    }

    public void setInfoList(List<String> infoList) {
        this.infoList = infoList;
    }

    public String checkResult() {
        return String.join(" ", infoList) + " all check ready, fire";
    }
}
```

测试

```java title="InterceptorTest.java"
import io.nozdormu.interceptor.test.beans.Satellite;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class InterceptorTest {

    @Test
    void testSatellite() {
        Satellite satellite = BeanContext.get(Satellite.class);
        assertEquals(satellite.startup("nozdormu"), "first stage fired -> second stage fired -> hello nozdormu I am NASA");
    }
}
```

## **切面 API**

### InvocationContext

使用 InvocationContext 获得切面运行时的参数和方法

| 注解                                   | 参数   | 返回值                | 说明                                       |
| -------------------------------------- | ------ | --------------------- | ------------------------------------------ |
| Object getTarget()                     | 无     | Object                | 返回目标实例                               |
| Method getMethod()                     | 无     | Method                | 返回调用拦截器的目标类的方法               |
| Constructor\<?\> getConstructor()      | 无     | Constructor\<?\>      | 返回调用拦截器方法的目标类的构造函数       |
| Object[] getParameters()               | 无     | Object[]              | 返回将传递给目标类的方法或构造函数的参数值 |
| void setParameters(Object[] params)    | 参数值 | 无                    | 设置将传递给目标类的方法或构造函数的参数值 |
| Map\<String, Object\> getContextData() | 无     | Map\<String, Object\> | 与此调用或生命周期回调相关的上下文数据     |
| Object proceed() throws Exception      | 无     | Object                | 继续执行拦截器链中的下一个拦截器           |

## **注解说明**

### Interceptor

| 注解                                   | 目标 | 说明                     |
| -------------------------------------- | ---- | ------------------------ |
| jakarta.interceptor.InterceptorBinding | 注解 | 标记需要切面处理的注解   |
| jakarta.interceptor.Interceptor        | 类   | 标记切面的实现类         |
| jakarta.interceptor.AroundInvoke       | 方法 | 标记方法切面的实现方法   |
| jakarta.interceptor.AroundConstruct    | 方法 | 标记构造器切面的实现方法 |
| jakarta.annotation.Priority            | 类   | 配置切面的执行顺序       |
