---
sidebar_position: 2
---

# 类型

GraphQL 类型系统及 Graphoenix 拓展

## GraphQL类型

关于 GraphQL 类型定义的详细内容, 请参考GraphQL官网的[类型系统](https://graphql.org/learn/schema/)([中文版](https://graphql.cn/learn/schema/))

## 内置标量类型（Scalar Types）

Grpahoenix在[GraphQL标量](https://graphql.org/learn/schema/#scalar-types)的基础之上, 根据[Microprofile GraphQL 协议](https://download.eclipse.org/microprofile/microprofile-graphql-2.0/microprofile-graphql-spec-2.0.html#scalars)的规定进行拓展

| 参数名     | 说明                                                                 | JSON类型   | Java类型                                    | MySQL类型   | protobuf类型              |
| ---------- | -------------------------------------------------------------------- | ---------- | ------------------------------------------- | ----------- | ------------------------- |
| Int        | 有符号 32 位整数                                                     | number     | int/Integer<br />short/Short<br />byte/Byte | INT         | int32                     |
| Float      | 有符号双精度浮点值                                                   | number     | float/Float<br />double/Double              | FLOAT       | float                     |
| String     | UTF‐8 字符序列                                                       | string     | String<br />char/Character                  | VARCHAR     | string                    |
| Boolean    | true 或者 false                                                      | true/false | boolean/Boolean                             | BOOL        | bool                      |
| ID         | ID 标量类型表示一个唯一标识符，ID 类型使用和 String 一样的方式序列化 | string     | String                                      | VARCHAR/INT | string                    |
| BigInteger | 表示一个任意大小且精度完全准确的浮点数                               | number     | BigInteger                                  | BIGINT      | google.type.Decimal       |
| BigDecimal | 表示任意大小的整数                                                   | number     | BigDecimal                                  | DECIMAL     | google.type.Decimal       |
| Date       | 日期                                                                 | string     | java.time.LocalDate                         | DATE        | google.type.Date          |
| Time       | 时间                                                                 | string     | java.time.LocalTime                         | TIME        | google.type.TimeOfDay     |
| DateTime   | 日期时间                                                             | string     | java.time.LocalDateTime                     | DATETIME    | google.type.DateTime      |
| Timestamp  | 时间戳                                                               | string     | java.time.LocalDateTime                     | TIMESTAMP   | google.protobuf.Timestamp |



## 内置枚举类型（Enumeration Types）

Graphoenix内置枚举类如下

### Operator

| 参数名 | 说明                                    | SQL 示例                                                                  |
| ------ | --------------------------------------- | ------------------------------------------------------------------------- |
| EQ     | 等于                                    | WHERE t.field **=** 'xyz'                                                 |
| NEQ    | 不等于                                  | WHERE t.field **\<\>** 'xyz'                                              |
| LK     | 匹配(需要%)                             | WHERE t.field **LIKE** '%xyz%'                                            |
| NLK    | 不匹配(需要%)                           | WHERE t.field **NOT LIKE** '%xyz%'                                        |
| GT     | 大于                                    | WHERE t.field **\>** 'xyz'                                                |
| GTE    | 大于等于                                | WHERE t.field **\>=** 'xyz'                                               |
| LT     | 小于                                    | WHERE t.field **\<** 'xyz'                                                |
| LTE    | 小于等于                                | WHERE t.field **\<=** 'xyz'                                               |
| NIL    | 为 NULL                                 | WHERE t.field **IS NULL**                                                 |
| NNIL   | 不为 NULL                               | WHERE t.field **IS NOT NULL**                                             |
| IN     | 属于                                    | WHERE t.field **IN** ('x', 'y', 'z')                                      |
| NIN    | 不属于                                  | WHERE t.field **NOT IN** ('x', 'y', 'z')                                  |
| BT     | 在...区间(数组的每两个元素为一个区间)   | WHERE **t.field \> 1 AND t.field \< 3 AND t.field \> 5 AND t.field \< 7** |
| NBT    | 不在...区间(数组的每两个元素为一个区间) | WHERE **t.field \< 1 AND t.field \> 3 AND t.field \< 5 AND t.field \> 7** |

### Conditional

| 参数名 | 说明 | SQL 示例                                         |
| ------ | ---- | ------------------------------------------------ |
| AND    | 并   | WHERE t.field = 'xyz' **AND** t.field \<\> 'abc' |
| OR     | 或   | WHERE t.field = 'xyz' **OR** t.field \<\> 'abc'  |

### Sort

| 参数名 | 说明 | SQL 示例                      |
| ------ | ---- | ----------------------------- |
| ASC    | 升序 | **ORDER BY** t.field **ASC**  |
| DESC   | 降序 | **ORDER BY** t.field **DESC** |

### Func

| 参数名 | 说明   | SQL 示例                             |
| ------ | ------ | ------------------------------------ |
| COUNT  | 条数   | SELECT **COUNT(** field **)** FROM t |
| MAX    | 最大值 | SELECT **MAX(** field **)** FROM t   |
| MIN    | 最小值 | SELECT **MIN(** field **)** FROM t   |
| SUM    | 合计   | SELECT **SUM(** field **)** FROM t   |
| AVG    | 平均值 | SELECT **AVG(** field **)** FROM t   |

### Protocol

| 参数名  | 说明     | 协议                |
| ------- | -------- | ------------------- |
| LOCAL   | 本地调用 |                     |
| GRPC    | gRPC     | https://grpc.io/    |
| HTTP    | http     |                     |
| RSOCKET | RSocket  | https://rsocket.io/ |

## 内置对象类型和字段（Object Types and Fields）

### (Object)Connection

Graphoenix 会自动为所有 Object 类型生成对应的[Connection](https://relay.dev/graphql/connections.htm#sec-Connection-Types)对象

| 字段       | 类型                          | 说明           |
| ---------- | ----------------------------- | -------------- |
| totalCount | Int                           | 总条数         |
| pageInfo   | [PageInfo](#pageinfo)         | 分页(游标)信息 |
| edges      | [[(Object)Edge]](#objectedge) | 查询边缘       |

### (Object)Edge

Graphoenix 会自动为所有 Object 类型生成对应的[Edge](https://relay.dev/graphql/connections.htm#sec-Edge-Types)对象

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| cursor | String | 游标字段 |
| node   | Object | 查询节点 |

### PageInfo

| 字段            | 类型    | 说明           |
| --------------- | ------- | -------------- |
| hasNextPage     | Boolean | 是否存在下一页 |
| hasPreviousPage | Boolean | 是否存在上一页 |
| startCursor     | String  | 开始游标       |
| endCursor       | String  | 结束游标       |

## 内置输入类型（Input Types）

### (Scalar/Enum)Expression

Graphoenix为每个Scalar和Enum类型生成Expression输入类型用于查询

| 参数名   | 类型                  | 默认值 | 说明                   | SQL 示例                             |
| -------- | --------------------- | ------ | ---------------------- | ------------------------------------ |
| opr      | [Operator](#operator) | EQ     | 匹配符号               | WHERE t.field **=** 'xyz'            |
| val      | (Scalar/Enum)         | 无     | 匹配值                 | WHERE t.field = **'xyz'**            |
| arr      | [(Scalar/Enum)]       | 无     | 匹配列表               | WHERE t.field IN **('x', 'y', 'z')** |
| skipNull | Boolean               | false  | 如果值为 NULL 忽略参数 |                                      |

### (Object)Expression

Graphoenix为每个Object类型生成Expression输入类型用于查询

| 参数名  | 类型                                                    | 默认值 | 说明                                   | SQL 示例                                                 |
| ------- | ------------------------------------------------------- | ------ | -------------------------------------- | -------------------------------------------------------- |
| (field) | [(Scalar/Enum/Object)Expression](#scalarenumexpression) | 无     | 条件字段                               | SELECT id FROM t WHERE **t.field** = 'xyz'               |
| cond    | [Conditional](#conditional)                             | AND    | 参数内条件的组合关系                   | WHERE t.field = 'xyz' **AND** t.field \<\> 'abc'         |
| not     | Boolean                                                 | false  | 条件取非                               | WHERE **NOT** (t.field = 'xyz' AND t.field \<\> 'abc')   |
| exs     | [[(Object)Expression]](#objectexpression)               | 无     | 同一字段多次作为查询条件时可使用此参数 | WHERE **(** t.field = 'xyz' AND t.field \<\> 'abc' **)** |

### (Object)OrderBy

Graphoenix为每个Object类型生成Expression输入类型用于排序

| 参数名  | 类型          | 默认值 | 说明     | SQL 示例                              |
| ------- | ------------- | ------ | -------- | ------------------------------------- |
| (field) | [Sort](#sort) | 无     | 排序方式 | SELECT id FROM t **ORDER BY** t.field |

### (Object)Input

Graphoenix为每个Object类型生成Expression输入类型用于变更

| 参数名       | 类型                                      | 默认值 | 说明                                           | SQL 示例                                                                                                                     |
| ------------ | ----------------------------------------- | ------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| (field)      | Scalar/Enum/[(Object)Input](#objectinput) | 无     | 变更字段                                       | INSERT INTO t ( id, field ) VALUES ( 'x', 'y' ) ON DUPLICATE KEY UPDATE t.id = VALUES ( t.id ), t.field = VALUES ( t.field ) |
| where        | [(Object)Expression](#objectexpression)   | 无     | 更新条件                                       | UPDATE t SET field = 'z' WHERE id = 'x'                                                                                      |
| isDeprecated | Boolean                                   | false  | 删除标记( `@merge` 指令存在时表示从数组中移除) |

## 内置接口（Interfaces）

### Meta

Graphoenix规定所有Object类型实现Meta接口, 用于保存元信息

| 参数名        | 类型      | 默认值 | 说明     |
| ------------- | --------- | ------ | -------- |
| isDeprecated  | Boolean   | false  | 删除标记 |
| version       | Int       | 无     | 版本     |
| realmId       | Int       | 无     | 域       |
| createUserId  | String    | 无     | 创建用户 |
| createTime    | Timestamp | 无     | 创建时间 |
| updateUserId  | String    | 无     | 更新用户 |
| updateTime    | Timestamp | 无     | 更新时间 |
| createGroupId | String    | 无     | 创建组   |