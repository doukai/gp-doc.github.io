---
sidebar_position: 3
---

# 查询(query)
快速浏览查询示例.

## 基本查询
查询单个: 类型名 => camelCase (例: User => user)

查询列表: 类型名 => camelCase + List (例: User => userList)

### 1. 查询前5个用户
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

### 2. 查询名为Bob的用户
```graphql
{
  user(name: {opr: EQ, val: "Bob"}) {
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

### 3. 查询所有会员用户和价格大于200的产品
```graphql
{
  vip: userList(userType: {opr: EQ, val: VIP}) {
    name
  }
  greaterThan200: productList(price: {opr: GT, val: 200}) {
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

### 4. 查询产品列表, 价格由高到低
```graphql
{
  productList(orderBy: {price: DESC}) {
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

### 5. 查询价格在300以内, 价格最高的产品
```graphql
{
  product(price: {opr: LTE, val: 300}) {
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

### 6. 分组查询普通用户和会员用户的数量
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

### 7. 查询Alice的订单
```graphql
{
  user(name: {opr: EQ, val: "Alice"}) {
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


### 8. 查询购买了Phone的用户列表
```graphql
{
  userList(orders: {items: {product: {name: {opr: EQ, val: "Phone"}}}}) {
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
## 分页查询

Graphoenix支持[普通分页和游标分页](https://graphql.org/learn/pagination/)([中文](https://graphql.cn/learn/pagination/)), 支持[GraphQL Cursor Connections规范](https://relay.dev/graphql/connections.htm)

分页查询: 类型名 => camelCase + Connection (例: User => userConnection)

### 1. 查询用户第1页, 每页5条
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

### 2. 查询用户第2页, 每页5条
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

### 3. 查询用户第3页, 每页5条, 游标分页

[游标分页简介](https://github.com/x1ah/Blog/issues/15)

```json
{ id: "10", name: "Jane", email: "jane@example.com", userType: REGULAR },
{ id: "11", name: "Kyle", email: "kyle@example.com", userType: VIP },
```

查询Jane之后的5条, 游标字段默认为ID字段, 也可使用@cursor指定游标字段, 此处取Jane的id: 10

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

### 4. 查询用户第4页, 每页5条, 游标分页
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

Tina为最后一个用户, hasNextPage变为false

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