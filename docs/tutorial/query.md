---
sidebar_position: 3
---

# 查询(query)

快速浏览查询示例

## 基本查询

### **查询接口**

| 接口名     | 类型     | 参数                                  | 说明     | 示例 (Type=User) |
| ---------- | -------- | ------------------------------------- | -------- | ---------------- |
| (type)     | (Type)   | [(Type)QueryArguments](#查询参数)     | 查询单条 | user             |
| (type)List | [(Type)] | [(Type)ListQueryArguments](#查询参数) | 查询列表 | userList         |

### 查询单条

例: 查询名为 Bob 的用户

```graphql
{
  user(name: { opr: EQ, val: "Bob" }) {
    name
    email
    userType
  }
}
```

```json
{
  "data": {
    "user": {
      "name": "Bob",
      "email": "bob@example.com",
      "userType": "REGULAR"
    }
  }
}
```

### 查询列表

例: 查询前 5 个用户

```graphql
{
  userList(first: 5) {
    name
    email
    userType
  }
}
```

```json
{
  "data": {
    "userList": [
      {
        "name": "Alice",
        "email": "alice@example.com",
        "userType": "VIP"
      },
      {
        "name": "Bob",
        "email": "bob@example.com",
        "userType": "REGULAR"
      },
      {
        "name": "Charlie",
        "email": "charlie@example.com",
        "userType": "VIP"
      },
      {
        "name": "Diana",
        "email": "diana@example.com",
        "userType": "REGULAR"
      },
      {
        "name": "Edward",
        "email": "edward@example.com",
        "userType": "VIP"
      }
    ]
  }
}
```

### 条件查询

例: 查询所有会员用户和价格大于 200 的产品

```graphql
{
  vip: userList(userType: { opr: EQ, val: VIP }) {
    name
  }
  greaterThan200: productList(price: { opr: GT, val: 200 }) {
    name
    price
  }
}
```

```json
{
  "data": {
    "vip": [
      {
        "name": "Alice"
      },
      {
        "name": "Charlie"
      },
      {
        "name": "Edward"
      },
      {
        "name": "George"
      },
      {
        "name": "Ian"
      },
      {
        "name": "Kyle"
      },
      {
        "name": "Mike"
      },
      {
        "name": "Oliver"
      },
      {
        "name": "Quentin"
      },
      {
        "name": "Steve"
      }
    ],
    "greaterThan200": [
      {
        "name": "Laptop",
        "price": 999.99
      },
      {
        "name": "Phone",
        "price": 499.99
      },
      {
        "name": "Tablet",
        "price": 299.99
      }
    ]
  }
}
```

### 关联查询

1. 例: 查询 Alice 的订单

```graphql
{
  user(name: { opr: EQ, val: "Alice" }) {
    name
    orders {
      items {
        product {
          name
        }
        quantity
      }
    }
  }
}
```

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "orders": [
        {
          "items": [
            {
              "product": {
                "name": "Laptop"
              },
              "quantity": 1
            },
            {
              "product": {
                "name": "Tablet"
              },
              "quantity": 2
            }
          ]
        }
      ]
    }
  }
}
```

2. 例: 查询购买了 Phone 的用户列表

```graphql
{
  userList(
    orders: { items: { product: { name: { opr: EQ, val: "Phone" } } } }
  ) {
    name
    orders {
      items {
        product {
          name
        }
      }
    }
  }
}
```

```json
{
  "data": {
    "userList": [
      {
        "name": "Bob",
        "orders": [
          {
            "items": [
              {
                "product": {
                  "name": "Phone"
                }
              }
            ]
          }
        ]
      },
      {
        "name": "Diana",
        "orders": [
          {
            "items": [
              {
                "product": {
                  "name": "Laptop"
                }
              },
              {
                "product": {
                  "name": "Phone"
                }
              },
              {
                "product": {
                  "name": "Tablet"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 排序

例: 查询产品列表, 价格由高到低

```graphql
{
  productList(orderBy: { price: DESC }) {
    name
    price
  }
}
```

```json
{
  "data": {
    "productList": [
      {
        "name": "Laptop",
        "price": 999.99
      },
      {
        "name": "Phone",
        "price": 499.99
      },
      {
        "name": "Tablet",
        "price": 299.99
      },
      {
        "name": "Monitor",
        "price": 199.99
      },
      {
        "name": "Keyboard",
        "price": 49.99
      }
    ]
  }
}
```

### 统计

#### **统计字段**

Graphoenix 会为所有的 Scalar 类型的字段生成统计字段

| 参数名       | 类型     | 说明   | SQL 示例                             |
| ------------ | -------- | ------ | ------------------------------------ |
| (field)Count | Int      | 条数   | SELECT **COUNT(** field **)** FROM t |
| (field)Max   | (Scalar) | 最大值 | SELECT **MAX(** field **)** FROM t   |
| (field)Min   | (Scalar) | 最小值 | SELECT **MIN(** field **)** FROM t   |
| (field)Sum   | (Scalar) | 合计   | SELECT **SUM(** field **)** FROM t   |
| (field)Avg   | (Scalar) | 平均值 | SELECT **AVG(** field **)** FROM t   |

1. 例: 查询价格在 300 以内, 价格最高的产品

```graphql
{
  product(price: { opr: LTE, val: 300 }) {
    name
    priceMax
  }
}
```

```json
{
  "data": {
    "product": {
      "name": "Tablet",
      "priceMax": 299.99
    }
  }
}
```

2. 例: 分组查询普通用户和会员用户的数量

```graphql
{
  userList(groupBy: ["userType"]) {
    userType
    idCount
  }
}
```

```json
{
  "data": {
    "userList": [
      {
        "userType": "VIP",
        "idCount": 10
      },
      {
        "userType": "REGULAR",
        "idCount": 10
      }
    ]
  }
}
```

---

## 分页查询

Graphoenix 支持[普通分页和游标分页](https://graphql.org/learn/pagination/)([中文](https://graphql.cn/learn/pagination/)), 支持[GraphQL Cursor Connections 规范](https://relay.dev/graphql/connections.htm)

### **分页接口**

| 接口名           | 类型             | 参数                                        | 说明     | 示例 (Type=User) |
| ---------------- | ---------------- | ------------------------------------------- | -------- | ---------------- |
| (type)Connection | (Type)Connection | [(Type)ConnectionQueryArguments](#查询参数) | 查询单条 | userConnection   |

### **分页类型**

所有的分页接口都会返回 [Connection](https://relay.dev/graphql/connections.htm#sec-Connection-Types) 类型的数据, 该类型包含条数, 分页(游标)信息和边缘, 边缘中包含所查询的对象(node)和游标, 兼容普通分页和游标分页两种返回结果

#### (Object)Connection

Graphoenix 会自动为所有 Object 类型生成对应的[Connection](https://relay.dev/graphql/connections.htm#sec-Connection-Types)对象

| 字段       | 类型                          | 说明           |
| ---------- | ----------------------------- | -------------- |
| totalCount | Int                           | 总条数         |
| pageInfo   | [PageInfo](#pageinfo)         | 分页(游标)信息 |
| edges      | [[(Object)Edge]](#objectedge) | 查询边缘       |

#### PageInfo

| 字段            | 类型    | 说明           |
| --------------- | ------- | -------------- |
| hasNextPage     | Boolean | 是否存在下一页 |
| hasPreviousPage | Boolean | 是否存在上一页 |
| startCursor     | String  | 开始游标       |
| endCursor       | String  | 结束游标       |

#### (Object)Edge

Graphoenix 会自动为所有 Object 类型生成对应的[Edge](https://relay.dev/graphql/connections.htm#sec-Edge-Types)对象

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| cursor | String | 游标字段 |
| node   | Object | 查询节点 |

### 基本分页

1. 查询用户第 1 页, 每页 5 条

```graphql
{
  userConnection(first: 5) {
    totalCount
    edges {
      node {
        name
        email
        userType
      }
    }
  }
}
```

```json
{
  "data": {
    "userConnection": {
      "totalCount": 20,
      "edges": [
        {
          "node": {
            "name": "Alice",
            "email": "alice@example.com",
            "userType": "VIP"
          }
        },
        {
          "node": {
            "name": "Bob",
            "email": "bob@example.com",
            "userType": "REGULAR"
          }
        },
        {
          "node": {
            "name": "Charlie",
            "email": "charlie@example.com",
            "userType": "VIP"
          }
        },
        {
          "node": {
            "name": "Diana",
            "email": "diana@example.com",
            "userType": "REGULAR"
          }
        },
        {
          "node": {
            "name": "Edward",
            "email": "edward@example.com",
            "userType": "VIP"
          }
        }
      ]
    }
  }
}
```

2. 查询用户第 2 页, 每页 5 条

```graphql
{
  userConnection(offset: 5, first: 5) {
    totalCount
    edges {
      node {
        name
        email
        userType
      }
    }
  }
}
```

```json
{
  "data": {
    "userConnection": {
      "totalCount": 20,
      "edges": [
        {
          "node": {
            "name": "Fiona",
            "email": "fiona@example.com",
            "userType": "REGULAR"
          }
        },
        {
          "node": {
            "name": "George",
            "email": "george@example.com",
            "userType": "VIP"
          }
        },
        {
          "node": {
            "name": "Hannah",
            "email": "hannah@example.com",
            "userType": "REGULAR"
          }
        },
        {
          "node": {
            "name": "Ian",
            "email": "ian@example.com",
            "userType": "VIP"
          }
        },
        {
          "node": {
            "name": "Jane",
            "email": "jane@example.com",
            "userType": "REGULAR"
          }
        }
      ]
    }
  }
}
```

### 游标分页

[游标分页简介](https://github.com/x1ah/Blog/issues/15)

1. 查询用户第 3 页, 每页 5 条, 游标分页

```json
{ id: "10", name: "Jane", email: "jane@example.com", userType: REGULAR },
{ id: "11", name: "Kyle", email: "kyle@example.com", userType: VIP },
```

查询 Jane 之后的 5 条, 游标字段默认为 ID 字段, 也可使用@cursor 指定游标字段, 此处取 Jane 的 id: 10

```graphql
{
  userConnection(after: 10, first: 5) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        name
        email
        userType
      }
    }
  }
}
```

```json
{
  "data": {
    "userConnection": {
      "pageInfo": {
        // highlight-start
        "hasNextPage": true
        // highlight-end
      },
      "edges": [
        {
          "cursor": "11",
          "node": {
            "name": "Kyle",
            "email": "kyle@example.com",
            "userType": "VIP"
          }
        },
        {
          "cursor": "12",
          "node": {
            "name": "Laura",
            "email": "laura@example.com",
            "userType": "REGULAR"
          }
        },
        {
          "cursor": "13",
          "node": {
            "name": "Mike",
            "email": "mike@example.com",
            "userType": "VIP"
          }
        },
        {
          "cursor": "14",
          "node": {
            "name": "Nina",
            "email": "nina@example.com",
            "userType": "REGULAR"
          }
        },
        {
          "cursor": "15",
          "node": {
            "name": "Oliver",
            "email": "oliver@example.com",
            "userType": "VIP"
          }
        }
      ]
    }
  }
}
```

2. 查询用户第 4 页, 每页 5 条, 游标分页

```graphql
{
  userConnection(after: 15, first: 5) {
    pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        name
        email
        userType
      }
    }
  }
}
```

Tina 为最后一个用户, hasNextPage 变为 false

```json
{
  "data": {
    "userConnection": {
      "pageInfo": {
        // highlight-start
        "hasNextPage": false
        // highlight-end
      },
      "edges": [
        {
          "cursor": "16",
          "node": {
            "name": "Paula",
            "email": "paula@example.com",
            "userType": "REGULAR"
          }
        },
        {
          "cursor": "17",
          "node": {
            "name": "Quentin",
            "email": "quentin@example.com",
            "userType": "VIP"
          }
        },
        {
          "cursor": "18",
          "node": {
            "name": "Rachel",
            "email": "rachel@example.com",
            "userType": "REGULAR"
          }
        },
        {
          "cursor": "19",
          "node": {
            "name": "Steve",
            "email": "steve@example.com",
            "userType": "VIP"
          }
        },
        {
          "cursor": "20",
          "node": {
            "name": "Tina",
            "email": "tina@example.com",
            "userType": "REGULAR"
          }
        }
      ]
    }
  }
}
```

---

## **查询参数**

| 参数名  | 类型                                                         | 默认值 | 说明                                   | SQL 示例 (x=10 y=5)                                      |
| ------- | ------------------------------------------------------------ | ------ | -------------------------------------- | -------------------------------------------------------- |
| (field) | [(Scalar/Enum/Object)Expression](#scalarenumexpression-参数) | 无     | 条件字段                               | SELECT id FROM t WHERE **t.field** = 'xyz'               |
| first   | Int                                                          | 无     | 获取前 x 条                            | SELECT id FROM t LIMIT 10                                |
| last    | Int                                                          | 无     | 获取后 x 条                            | SELECT id FROM t ORDER BY id DESC LIMIT 10               |
| offset  | Int                                                          | 无     | 跳过 y 条                              | SELECT id FROM t LIMIT 5, 10                             |
| cond    | [Conditional](#conditional)                                  | AND    | 参数内条件的组合关系                   | WHERE t.field = 'xyz' **AND** t.field \<\> 'abc'         |
| not     | Boolean                                                      | false  | 条件取非                               | WHERE **NOT** (t.field = 'xyz' AND t.field \<\> 'abc')   |
| exs     | [[(Object)Expression]](#objectexpression-参数)               | 无     | 同一字段多次作为查询条件时可使用此参数 | WHERE **(** t.field = 'xyz' AND t.field \<\> 'abc' **)** |
| orderBy | [[(Object)OrderBy]](#objectorderby-参数)                     | 无     | 排序字段                               | SELECT id FROM t **ORDER BY** t.field                    |
| groupBy | [String]                                                     | 无     | 分组字段                               | SELECT id FROM t **GROUP BY** t.field                    |

#### (Scalar/Enum)Expression 参数

| 参数名   | 类型                  | 默认值 | 说明                   | SQL 示例                             |
| -------- | --------------------- | ------ | ---------------------- | ------------------------------------ |
| opr      | [Operator](#operator) | EQ     | 匹配符号               | WHERE t.field **=** 'xyz'            |
| val      | (Scalar/Enum)         | 无     | 匹配值                 | WHERE t.field = **'xyz'**            |
| arr      | [(Scalar/Enum)]       | 无     | 匹配列表               | WHERE t.field IN **('x', 'y', 'z')** |
| skipNull | Boolean               | false  | 如果值为 NULL 忽略参数 |                                      |

#### (Object)Expression 参数

| 参数名  | 类型                                                         | 默认值 | 说明                                   | SQL 示例                                                 |
| ------- | ------------------------------------------------------------ | ------ | -------------------------------------- | -------------------------------------------------------- |
| (field) | [(Scalar/Enum/Object)Expression](#scalarenumexpression-参数) | 无     | 条件字段                               | SELECT id FROM t WHERE **t.field** = 'xyz'               |
| cond    | [Conditional](#conditional)                                  | AND    | 参数内条件的组合关系                   | WHERE t.field = 'xyz' **AND** t.field \<\> 'abc'         |
| not     | Boolean                                                      | false  | 条件取非                               | WHERE **NOT** (t.field = 'xyz' AND t.field \<\> 'abc')   |
| exs     | [[(Object)Expression]](#objectexpression-参数)               | 无     | 同一字段多次作为查询条件时可使用此参数 | WHERE **(** t.field = 'xyz' AND t.field \<\> 'abc' **)** |

#### Operator

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

#### Conditional

| 参数名 | 说明 | SQL 示例                                         |
| ------ | ---- | ------------------------------------------------ |
| AND    | 并   | WHERE t.field = 'xyz' **AND** t.field \<\> 'abc' |
| OR     | 或   | WHERE t.field = 'xyz' **OR** t.field \<\> 'abc'  |

#### (Object)OrderBy 参数

| 参数名  | 类型          | 默认值 | 说明     | SQL 示例                              |
| ------- | ------------- | ------ | -------- | ------------------------------------- |
| (field) | [Sort](#sort) | 无     | 排序方式 | SELECT id FROM t **ORDER BY** t.field |

#### Sort

| 参数名 | 说明 | SQL 示例                      |
| ------ | ---- | ----------------------------- |
| ASC    | 升序 | **ORDER BY** t.field **ASC**  |
| DESC   | 降序 | **ORDER BY** t.field **DESC** |
