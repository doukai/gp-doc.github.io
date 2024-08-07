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

使用与字段同名的参数构造查询条件, [`opr`](/docs/guide/types#operator) 作为查询符号, [`val`](/docs/guide/types#scalarenumexpression) 作为查询内容, 如果查询内容为数组则使用 [`arr`](/docs/guide/types#scalarenumexpression)

例: 查询名为 Bob 的用户

```graphql
{
  # WHERE name = 'Bob'
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

使用 [`first`](#查询参数) 参数查询前 n 条数据, [`last`](#查询参数) 参数查询后 n 条数据

例: 查询前 5 个用户

```graphql
{
  # LIMIT 5
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
  # WHERE userType = 'VIP'
  vip: userList(userType: { opr: EQ, val: VIP }) {
    name
  }
  # WHERE price > 200
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
  # WHERE name = 'Alice'
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
  # WHERE EXISTS (SELECT 1 FROM order_item oi WHERE EXISTS (SELECT 1 FROM product p WHERE id = oi.product_id AND p.name = 'Phone'))
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

使用 [`orderBy`](#查询参数) 参数进行排序

例: 查询产品列表, 价格由高到低

```graphql
{
  # ORDER BY price DESC
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
    # MAX(price)
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

使用 [`groupBy`](#查询参数) 参数进行统计

2. 例: 分组查询普通用户和会员用户的数量

```graphql
{
  # GROUP BY userType
  userList(groupBy: ["userType"]) {
    userType
    # COUNT(id)
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

| 接口名           | 类型                                                   | 参数                                        | 说明     | 示例 (Type=User) |
| ---------------- | ------------------------------------------------------ | ------------------------------------------- | -------- | ---------------- |
| (type)Connection | [(Type)Connection](/docs/guide/types#objectconnection) | [(Type)ConnectionQueryArguments](#查询参数) | 查询单条 | userConnection   |

### 基本分页

1. 例: 查询用户第 1 页, 每页 5 条

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

可以使用 [`offset`](#查询参数) 参数来设置偏移数

2. 例: 查询用户第 2 页, 每页 5 条

```graphql
{
  # LIMIT 5, 5
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

1. 例: 查询用户第 3 页, 每页 5 条, 游标分页

```json
{ id: "10", name: "Jane", email: "jane@example.com", userType: REGULAR },
{ id: "11", name: "Kyle", email: "kyle@example.com", userType: VIP },
```

查询 Jane 之后的 5 条, 游标字段默认为 ID 字段, 也可使用 `@cursor` 指定游标字段, 此处取 Jane 的 id: 10

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

2. 例: 查询用户第 4 页, 每页 5 条, 游标分页

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

| 参数名  | 类型                                                                     | 默认值 | 说明                                   | SQL 示例 (x=10 y=5)                                      |
| ------- | ------------------------------------------------------------------------ | ------ | -------------------------------------- | -------------------------------------------------------- |
| (field) | [(Scalar/Enum/Object)Expression](/docs/guide/types#scalarenumexpression) | 无     | 条件字段                               | SELECT id FROM t WHERE **t.field** = 'xyz'               |
| first   | Int                                                                      | 无     | 获取前 x 条                            | SELECT id FROM t LIMIT 10                                |
| last    | Int                                                                      | 无     | 获取后 x 条                            | SELECT id FROM t ORDER BY id DESC LIMIT 10               |
| offset  | Int                                                                      | 无     | 跳过 y 条                              | SELECT id FROM t LIMIT 5, 10                             |
| cond    | [Conditional](/docs/guide/types#conditional)                             | AND    | 参数内条件的组合关系                   | WHERE t.field = 'xyz' **AND** t.field \<\> 'abc'         |
| not     | Boolean                                                                  | false  | 条件取非                               | WHERE **NOT** (t.field = 'xyz' AND t.field \<\> 'abc')   |
| exs     | [[(Object)Expression]](/docs/guide/types#objectexpression)               | 无     | 同一字段多次作为查询条件时可使用此参数 | WHERE **(** t.field = 'xyz' AND t.field \<\> 'abc' **)** |
| orderBy | [[(Object)OrderBy]](/docs/guide/types#objectorderby)                     | 无     | 排序字段                               | SELECT id FROM t **ORDER BY** t.field                    |
| groupBy | [String]                                                                 | 无     | 分组字段                               | SELECT id FROM t **GROUP BY** t.field                    |
