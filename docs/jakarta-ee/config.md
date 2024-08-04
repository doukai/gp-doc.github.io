---
sidebar_position: 3
---

# 配置(config)

[**Nozdormu**](https://github.com/doukai/nozdormu) 基于[MicroProfile Config](https://microprofile.io/specifications/microprofile-config/) 规范, 使用 [Typesafe Config](https://lightbend.github.io/config/) 实现配置管理. [Typesafe Config](https://lightbend.github.io/config/) 广泛用于 [Akka](https://akka.io/) 和 [Play Framework](https://www.playframework.com/) 中, 支持多种配置格式, 如 [HOCON](https://github.com/lightbend/config/blob/main/HOCON.md), JSON, Properties 等

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
    implementation 'io.nozdormu:nozdormu-config:0.0.1-SNAPSHOT'
    // highlight-end

    annotationProcessor 'io.nozdormu:nozdormu-inject:0.0.1-SNAPSHOT'
    // highlight-start
    annotationProcessor 'io.nozdormu:nozdormu-config:0.0.1-SNAPSHOT'
    // highlight-end
}
```

## 配置定义

### 定义配置类

使用 [`@ConfigProperties`](#注解说明) 标记配置类, 可为 null 的字段需要使用 [`@Optional`](#注解说明) 标记

```java title="DBConfig.java"
import com.typesafe.config.Optional;
import org.eclipse.microprofile.config.inject.ConfigProperties;

// highlight-start
// 定义配置前缀为 db
@ConfigProperties(prefix = "db")
// highlight-end
public class DBConfig {
    // highlight-start
    @Optional
    // highlight-end
    private String host = "127.0.0.1";

    // highlight-start
    @Optional
    // highlight-end
    private Integer port = 3306;

    private String user;

    private String password;

    // highlight-start
    @Optional
    // highlight-end
    private String db;

    // getter and setter...
}
```

### 定义配置文件

支持 [HOCON](https://github.com/lightbend/config/blob/main/HOCON.md), JSON, Properties 三种格式, 根据不同的配置文件类型选择不同的文件拓展名

1. HOCON: `.conf`
2. JSON: `.json`
3. Properties: `.properties`

根据配置文件的种类, 文件名分为 reference 和 application

| 名称             | 用途                                                                                                                           | 加载顺序                                                                                                                                                                                                   | 说明                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| reference.conf   | 用于定义库或框架的默认配置. 库和框架开发者通常会在 `reference.conf` 中提供默认配置, 这样使用者可以根据需要覆盖这些默认值       | `reference.conf` 文件通常在类路径中被首先加载, 具有最低的优先级. 多个 `reference.conf` 文件会合并在一起, 后加载的文件不会覆盖先加载的文件中的配置项, 而是会被合并                                          | 用于库或框架的默认配置, 加载优先级较低                     |
| application.conf | 用于应用程序的自定义配置. 应用开发者可以在 `application.conf` 中定义和覆盖 `reference.conf` 中的默认配置, 以适应特定的应用需求 | `application.conf` 文件在 `reference.conf` 文件之后加载, 具有更高的优先级. 如果 `application.conf` 中定义了与 `reference.conf` 相同的配置项, `application.conf` 中的配置将覆盖 `reference.conf` 中的默认值 | 用于应用程序的自定义配置, 加载优先级较高, 用于覆盖默认配置 |

```conf title="application.conf"
db {
  user = "root"
  password = "pass"
}
```

```json title="application.json"
"db" : {
  "user" : "root"
  "password" : "pass"
}
```

```properties title="application.properties"
foo.user=root
foo.password=pass
```

## 配置注入

### Setter 方法注入

使用 Setter 方式注入, 在字段或 Setter 方法上使用 [`@ConfigProperty`](#注解说明) 注解

例: 数据库配置注入到查询对象内

```java title="QueryDAO.java"
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class QueryDAO {
    // highlight-start
    @ConfigProperty
    // highlight-end
    private DBConfig dbConfig;

    public void setDbConfig(DBConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    public String getDBInfo() {
        return dbConfig.toString();
    }

    public DBConfig getDbConfig() {
        return dbConfig;
    }
}
```

测试

```java title="ConfigTest.java"
import io.nozdormu.config.test.config.DBConfig;
import io.nozdormu.spi.context.BeanContext;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class ConfigTest {

    @Test
    void testDBConfig() {
        QueryDAO queryDAO = BeanContext.get(QueryDAO.class);
        DBConfig dbConfig = queryDAO.getDbConfig();
        assertEquals(dbConfig.getHost(), "127.0.0.1");
        assertEquals(dbConfig.getPort(), 3306);
        assertEquals(dbConfig.getUser(), "root");
        assertEquals(dbConfig.getPassword(), "pass");
        assertNull(dbConfig.getDb());
    }
}
```

### 构造方法注入

使用构造方法进行依赖注入, 在构造方法上使用 [`@Inject`](/docs/jakarta-ee/inject#cdi) 注解

例: 使用构造方法把数据库配置注入到查询对象内

```java title="QueryDAO.java"
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class QueryDAO {
    private DBConfig dbConfig;

    // highlight-start
    @Inject
    public QueryDAO(DBConfig dbConfig) {
        this.dbConfig = dbConfig;
    }
    // highlight-end

    public String getDBInfo() {
        return dbConfig.toString();
    }

    public DBConfig getDbConfig() {
        return dbConfig;
    }
}
```

---

## **配置 API**

### ConfigProviderResolver

使用 ConfigProviderResolver 获取 [Config](#config) 实例

例: `Config config = ConfigProviderResolver.instance().getConfig();`

| 方法                                     | 参数 | 返回值                 | 说明             |
| ---------------------------------------- | ---- | ---------------------- | ---------------- |
| static ConfigProviderResolver instance() | 无   | ConfigProviderResolver | 获取配置工厂实例 |
| Config getConfig()                       | 无   | Config                 | 获取 Config 实例 |

### Config

使用 Config 获取 配置实例

例: `DBConfig dbConfig = config.getValue("db", DBConfig.class);`

| 方法                                                                         | 参数                               | 返回值        | 说明                           |
| ---------------------------------------------------------------------------- | ---------------------------------- | ------------- | ------------------------------ |
| T getValue(String propertyName, Class\<T\> propertyType)                     | 配置属性名称, 属性值应转换为的类型 | T             | 返回配置对象                   |
| Optional\<T\> getOptionalValue(String propertyName, Class\<T\> propertyType) | 配置属性名称, 属性值应转换为的类型 | Optional\<T\> | 返回 Optional 包装的配置对象型 |

## **注解说明**

| 注解                                                    | 目标      | 说明                                 |
| ------------------------------------------------------- | --------- | ------------------------------------ |
| org.eclipse.microprofile.config.inject.ConfigProperties | 类        | 标记配置类, 使用 prefix 字段配置前缀 |
| org.eclipse.microprofile.config.inject.ConfigProperty   | 字段,方法 | 标记需要注入的配置                   |
| com.typesafe.config.Optional                            | 字段      | 标记可为 null 的配置字段             |

## *本节示例*
https://github.com/doukai/nozdormu/tree/main/nozdormu-config/src/test/java/io/nozdormu/config/test