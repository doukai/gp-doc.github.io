---
sidebar_position: 4
---

# 变更(mutation)

快速浏览变更示例.

变更包含新增(Insert)和更新(Update)两种操作, 在 GraphQL 的基础之上, 我们规定:

1. 每个 Object**有且仅有 1 个 ID 类型的字段**
2. 在变更时, 如果 ID 类型的字段为空, 则新增, ID 字段由数据库自动生成
3. 在变更时, 如果 ID 类型的字段不为空, 则由数据库判断, 数据库包含该值时更新, 反之则进行新增

另外, 查询(query)字段时, 是并行执行, 而**变更(mutation)字段时, 是线性执行, 一个接着一个**

## 基本变更

变更单个: 类型名 => camelCase (例: User => user)

变更列表: 类型名 => camelCase + List (例: User => userList)

### 1. 新增用户 Uma

```graphql
mutation {
  user(
    name: "Uma"
    email: "uma@example.com"
    userType: VIP
    phoneNumbers: ["13918124629", "18536492446"]
  ) {
    id
    name
    email
    phoneNumbers
    userType
  }
}
```

数据库自动生成 id

```json
{
  "data": {
    "user": {
      // highlight-start
      "id": "21",
      // highlight-end
      "name": "Uma",
      "email": "uma@example.com",
      "phoneNumbers": ["13918124629", "18536492446"],
      "userType": "VIP"
    }
  }
}
```

### 2. 新增用户 Victor 和 Wendy

```graphql
mutation {
  userList(
    list: [
      {
        name: "Victor"
        email: "victor@example.com"
        userType: REGULAR
        phoneNumbers: ["17250165257", "15548312357"]
      }
      {
        id: "23"
        name: "Wendy"
        email: "wendy@example.com"
        userType: VIP
        phoneNumbers: ["19703870624"]
      }
    ]
  ) {
    id
    name
    email
    phoneNumbers
    userType
  }
}
```

Victor 的 id 由数据库生成, Wendy 的 id 是变更时指定

```json
{
  "data": {
    "userList": [
      {
        // highlight-start
        "id": "22",
        // highlight-end
        "name": "Victor",
        "email": "victor@example.com",
        "phoneNumbers": ["17250165257", "15548312357"],
        "userType": "REGULAR"
      },
      {
        // highlight-start
        "id": "23",
        // highlight-end
        "name": "Wendy",
        "email": "wendy@example.com",
        "phoneNumbers": ["19703870624"],
        "userType": "VIP"
      }
    ]
  }
}
```

### 3. 新增用户 Xander, 同时购买新增的产品 Mouse

```graphql
mutation {
  user(
    name: "Xander"
    email: "xander@example.com"
    userType: REGULAR
    orders: [
      { items: [{ product: { name: "Mouse", price: 25.99 }, quantity: 2 }] }
    ]
  ) {
    id
    name
    email
    userType
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
      "id": "24",
      "name": "Xander",
      "email": "xander@example.com",
      "userType": "REGULAR",
      "orders": [
        {
          "items": [
            {
              "product": {
                "name": "Mouse"
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

```graphql
{
  productList {
    id
    name
    price
  }
}
```

新增产品 Mouse

```json
{
  "data": {
    "productList": [
      {
        "id": "1",
        "name": "Laptop",
        "price": 999.99
      },
      {
        "id": "2",
        "name": "Phone",
        "price": 499.99
      },
      {
        "id": "3",
        "name": "Tablet",
        "price": 299.99
      },
      {
        "id": "4",
        "name": "Monitor",
        "price": 199.99
      },
      {
        "id": "5",
        "name": "Keyboard",
        "price": 49.99
      },
      // highlight-start
      {
        "id": "6",
        "name": "Mouse",
        "price": 25.99
      }
      // highlight-end
    ]
  }
}
```

## 更新

### 1. 通过 ID 类型字段更新 Uma 的用户类型

```graphql
mutation {
  user(id: "21", name: "Uma", userType: REGULAR) {
    id
    name
    userType
  }
}
```

```json
{
  "data": {
    "user": {
      "id": "21",
      "name": "Uma",
      // highlight-start
      "userType": "REGULAR"
      // highlight-end
    }
  }
}
```

### 2. 通过 where 字段更新 Uma 的用户类型

有些时候 Object 中存在非空字段, 例如 User 的 name 字段, 需要在更新时额外输入, 此时可以使用 where 字段进行更新

```graphql
mutation {
  user(userType: VIP, where: { id: { opr: EQ, val: "21" } }) {
    id
    name
    userType
  }
}
```

```json
{
  "data": {
    "user": {
      "id": "21",
      "name": "Uma",
      // highlight-start
      "userType": "VIP"
      // highlight-end
    }
  }
}
```

## 删除

### 1. 删除用户 Wendy

使用`isDeprecated: true`表示要删除对象

```graphql
mutation {
  user(isDeprecated: true, where: { id: { opr: EQ, val: "23" } }) {
    id
    name
  }
}
```

```json
{
  "data": {
    "user": null
  }
}
```

## 合并对象数组

对于对象数组[Object], 除了全量变更之外, 有时需要添加或移除元素, 此时需要使用@merge 指令进行元素合并

首先查询 Diana 的订单

```graphql
{
  user(name: { opr: EQ, val: "Diana" }) {
    name
    orders {
      id
      items {
        id
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
      "name": "Diana",
      "orders": [
        {
          // highlight-start
          "id": "4",
          // highlight-end
          "items": [
            {
              "id": "6",
              "product": {
                "name": "Laptop"
              },
              "quantity": 1
            },
            {
              "id": "7",
              "product": {
                "name": "Phone"
              },
              "quantity": 1
            },
            {
              "id": "8",
              "product": {
                "name": "Tablet"
              },
              "quantity": 1
            }
          ]
        }
      ]
    }
  }
}
```

### 1. Diana 的订单增加 2 个 Keyboard

使用`where: {id: {opr: EQ, val: "4"}}`来选择 Diana 的订单, 使用`where: {id: {opr: EQ, val: "5"}}`来选择 Keyboard

where 除了作为更新条件之外, 还可用于通过 ID 字段选择对象

```graphql
mutation {
  order(
    items: [{ product: { where: { id: { opr: EQ, val: "5" } } }, quantity: 2 }]
    where: { id: { opr: EQ, val: "4" } }
  ) @merge {
    id
    items {
      id
      product {
        name
      }
      quantity
    }
  }
}
```

```json
{
  "data": {
    "order": {
      "id": "4",
      "items": [
        {
          "id": "6",
          "product": {
            "name": "Laptop"
          },
          "quantity": 1
        },
        {
          "id": "7",
          "product": {
            "name": "Phone"
          },
          "quantity": 1
        },
        {
          "id": "8",
          "product": {
            "name": "Tablet"
          },
          "quantity": 1
        },
        // highlight-start
        {
          "id": "10",
          "product": {
            "name": "Keyboard"
          },
          "quantity": 2
        }
        // highlight-end
      ]
    }
  }
}
```

### 2. 移除 Diana 的订单中的 Tablet

使用`where: {id: {opr: EQ, val: "4"}}`来选择 Diana 的订单, 使用`where: {id: {opr: EQ, val: "8"}}`来选择 Tablet 所在的订单项, 使用`isDeprecated: true`标记要移除的元素

```graphql
mutation {
  order(
    items: [{ isDeprecated: true, where: { id: { opr: EQ, val: "8" } } }]
    where: { id: { opr: EQ, val: "4" } }
  ) @merge {
    id
    items {
      id
      product {
        name
      }
      quantity
    }
  }
}
```

```json
{
  "data": {
    "order": {
      "id": "4",
      "items": [
        {
          "id": "6",
          "product": {
            "name": "Laptop"
          },
          "quantity": 1
        },
        {
          "id": "7",
          "product": {
            "name": "Phone"
          },
          "quantity": 1
        },
        {
          "id": "10",
          "product": {
            "name": "Keyboard"
          },
          "quantity": 2
        }
      ]
    }
  }
}
```
